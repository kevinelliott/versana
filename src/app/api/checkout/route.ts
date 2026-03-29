import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    // @ts-ignore
    apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, productId, amount } = body;

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Mock mode if no real key
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_mock') {
            console.log("Mocking Stripe Checkout for local dev");
            return NextResponse.json({ url: '/profile?success=true' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: 'author@versana.app', // Usually pull from User metadata
            client_reference_id: userId,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: productId === 'basic_mana' ? 'Basic Mana Pack (10,000)' : 'Pro Mana Pack (100,000)',
                            description: 'Versana API Tokens for AI Services',
                        },
                        unit_amount: amount, // in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?canceled=true`,
            metadata: {
                userId,
                productId
            }
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
