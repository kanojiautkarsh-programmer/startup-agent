import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { logAuditEvent, getRequestContext } from '@/lib/audit/logger';

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase configuration');
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user } } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { encryptedKey, salt, keyFingerprint, action } = body;

    if (action === 'store') {
      if (!encryptedKey || !salt || !keyFingerprint) {
        return NextResponse.json(
          { error: 'Missing required fields: encryptedKey, salt, keyFingerprint' },
          { status: 400 }
        );
      }

      const { data: existingKey } = await supabaseAdmin
        .from('user_encryption_keys')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingKey) {
        const { error: updateError } = await supabaseAdmin
          .from('user_encryption_keys')
          .update({
            encrypted_key_encrypted: encryptedKey,
            salt,
            key_fingerprint: keyFingerprint,
            rotated_at: new Date().toISOString(),
            previous_key_id: existingKey.id,
            last_used_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        await supabaseAdmin
          .from('profiles')
          .update({ e2ee_enabled: true })
          .eq('id', user.id);

        await logAuditEvent({
          userId: user.id,
          action: 'encryption_key_rotated',
          resourceType: 'encryption_key',
          metadata: { fingerprint: keyFingerprint },
          status: 'success',
          ...getRequestContext(request),
        });

        return NextResponse.json({ success: true, message: 'Key rotated successfully' });
      } else {
        const { error: insertError } = await supabaseAdmin
          .from('user_encryption_keys')
          .insert({
            user_id: user.id,
            encrypted_key_encrypted: encryptedKey,
            salt,
            key_fingerprint: keyFingerprint,
          });

        if (insertError) throw insertError;

        await supabaseAdmin
          .from('profiles')
          .update({ e2ee_enabled: true })
          .eq('id', user.id);

        await logAuditEvent({
          userId: user.id,
          action: 'api_key_created',
          resourceType: 'encryption_key',
          metadata: { fingerprint: keyFingerprint },
          status: 'success',
          ...getRequestContext(request),
        });

        return NextResponse.json({ success: true, message: 'Key stored successfully' });
      }
    }

    if (action === 'check') {
      const { data: keyData } = await supabaseAdmin
        .from('user_encryption_keys')
        .select('key_fingerprint, created_at, rotated_at')
        .eq('user_id', user.id)
        .single();

      return NextResponse.json({
        enabled: !!keyData,
        fingerprint: keyData?.key_fingerprint,
        createdAt: keyData?.created_at,
        rotatedAt: keyData?.rotated_at,
      });
    }

    if (action === 'verify') {
      const { data: keyData } = await supabaseAdmin
        .from('user_encryption_keys')
        .select('encrypted_key_encrypted, salt')
        .eq('user_id', user.id)
        .single();

      if (!keyData) {
        return NextResponse.json({ error: 'No encryption key found' }, { status: 404 });
      }

      await supabaseAdmin
        .from('user_encryption_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('user_id', user.id);

      return NextResponse.json({
        encryptedKey: keyData.encrypted_key_encrypted,
        salt: keyData.salt,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('E2EE API error:', error);
    return NextResponse.json({ error: 'E2EE operation failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user } } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('user_encryption_keys')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;

    await supabaseAdmin
      .from('profiles')
      .update({ e2ee_enabled: false, e2ee_key_id: null })
      .eq('id', user.id);

    await logAuditEvent({
      userId: user.id,
      action: 'api_key_deleted',
      resourceType: 'encryption_key',
      status: 'success',
      ...getRequestContext(request),
    });

    return NextResponse.json({ success: true, message: 'Encryption key deleted' });
  } catch (error) {
    console.error('E2EE delete error:', error);
    return NextResponse.json({ error: 'Failed to delete encryption key' }, { status: 500 });
  }
}

