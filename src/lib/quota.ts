import { createAdminClient } from './supabase/server';

export const TIERS = {
    free: { limit: 100_000 },
    pro: { limit: 1_000_000 },
    master: { limit: 5_000_000 }
};

export async function checkTokenQuota(userId: string): Promise<{ allowed: boolean, remaining: number }> {
    if (!userId) return { allowed: false, remaining: 0 };
    if (process.env.NODE_ENV === 'development') {
        return { allowed: true, remaining: 1000000 };
    }

    try {
        const adminSupabase = createAdminClient();

        // 1. Get user tier
        const { data: user, error: userErr } = await adminSupabase
            .from('users')
            .select('subscription_tier')
            .eq('id', userId)
            .single();

        if (userErr || !user) {
            return { allowed: false, remaining: 0 };
        }

        const tier = (user.subscription_tier as keyof typeof TIERS) || 'free';
        const limit = TIERS[tier]?.limit || TIERS.free.limit;

        // 2. Sum up API usage for the current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: usage, error: usageErr } = await adminSupabase
            .from('api_usage_logs')
            .select('tokens_used')
            .eq('user_id', userId)
            .gte('created_at', startOfMonth.toISOString());

        if (usageErr) {
            return { allowed: true, remaining: limit }; // Default to true if logs fail
        }

        const used = (usage || []).reduce((acc: number, log: { tokens_used?: number }) => acc + (log.tokens_used || 0), 0);

        return {
            allowed: used < limit,
            remaining: Math.max(0, limit - used)
        };
    } catch (err) {
        console.error("Quota check failed:", err);
        return { allowed: true, remaining: TIERS.free.limit };
    }
}
