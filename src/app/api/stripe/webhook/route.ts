import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const PLANS = {
  starter: { priceId: process.env.STRIPE_STARTER_PRICE_ID, name: 'Starter' },
  pro: { priceId: process.env.STRIPE_PRO_PRICE_ID, name: 'Pro' },
  enterprise: { priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID, name: 'Enterprise' },
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  const sig = headersList.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (userId && plan) {
          const { createClient } = await import('@/lib/supabase/server');
          const supabase = await createClient();

          const periodEnd = new Date();
          periodEnd.setMonth(periodEnd.getMonth() + 1);

          await supabase.from('subscriptions').upsert({
            user_id: userId,
            plan,
            status: 'active',
            current_period_end: periodEnd.toISOString(),
          }, {
            onConflict: 'user_id',
          });

          await supabase.from('profiles').update({ plan }).eq('id', userId);

          await supabase.from('audit_logs').insert({
            user_id: userId,
            action: 'subscription_created',
            resource_type: 'stripe',
            metadata: { plan, session_id: session.id },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();

        await supabase.from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_customer_id', customerId);

        await supabase.from('profiles')
          .update({ plan: 'starter' })
          .eq('stripe_customer_id', customerId);

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();

        await supabase.from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_customer_id', customerId);

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
