import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("Missing env vars")
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function seedUser() {
    const userId = '00000000-0000-0000-0000-000000000000';

    console.log("Creating auth user...")
    // Supabase auth.admin bypasses email sending and creates directly
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: 'dev@versana.io',
        email_confirm: true,
        password: 'password123',
    })

    if (authError && !authError.message.includes('already registered')) {
        console.error("Auth User Error:", authError)
        return
    }

    const createdUserId = authUser?.user?.id;
    console.log("Auth user created or exists. ID:", createdUserId)

    if (createdUserId) {
        // Now insert into public.users
        const { error: publicError } = await supabase.from('users').upsert({
            id: createdUserId,
            email: 'dev@versana.io',
            full_name: 'Dev User',
            subscription_tier: 'master'
        })
        if (publicError) {
            console.error("Public User Error:", publicError)
        } else {
            console.log("Successfully seeded public.users with ID:", createdUserId)
        }
    }
}

seedUser()
