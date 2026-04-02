import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { logAuditEvent, getRequestContext } from '@/lib/audit/logger';
import type { AuditAction } from '@/lib/audit/types';

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      action, 
      resourceType, 
      resourceId, 
      metadata, 
      status = 'success',
      failureReason 
    } = body;

    if (!userId || !action || !resourceType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, action, resourceType' },
        { status: 400 }
      );
    }

    const context = getRequestContext(request);

    const auditId = await logAuditEvent({
      userId,
      action: action as AuditAction,
      resourceType,
      resourceId,
      metadata,
      status,
      failureReason,
      ...context,
    });

    return NextResponse.json({ 
      success: true, 
      auditId,
      message: 'Audit event logged successfully' 
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    return NextResponse.json(
      { error: 'Failed to log audit event' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const eventType = searchParams.get('eventType');
    const action = searchParams.get('action');
    const resourceType = searchParams.get('resourceType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

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

    const canViewAllLogs = user.email === process.env.ADMIN_EMAIL;
    const targetUserId = canViewAllLogs ? userId : user.id;

    const { data, count, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', canViewAllLogs ? targetUserId : user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      data,
      count,
      pagination: {
        limit,
        offset,
        total: count,
      }
    });
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
