import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    // @ts-ignore
    apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_mock';

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature') as string;

        let event;

        if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_mock') {
            try {
                event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
            } catch (err: any) {
                console.error(`Webhook signature verification failed: ${err.message}`);
                return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
            }
        } else {
            // Mock local parsing
            console.log("Mocking Stripe Webhook event");
            event = JSON.parse(body);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId;
            const productId = session.metadata?.productId;

            if (userId) {
                const manaToAdd = productId === 'pro_mana' ? 100000 : 10000;
                
                const supabase = createAdminClient();
                // We attempt to RPC or update the balance. If column doesn't exist, we will silently catch in the response for this demo.
                const { data: user, error: fetchErr } = await supabase
                    .from('users')
                    .select('mana_balance')
                    .eq('id', userId)
                    .single();

                if (!fetchErr) {
                    const currentMana = user?.mana_balance || 0;
                    await supabase
                        .from('users')
                        .update({ mana_balance: currentMana + manaToAdd })
                        .eq('id', userId);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return new NextResponse('Webhook handler failed', { status: 500 });
    }
}
