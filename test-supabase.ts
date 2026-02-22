import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://igpdarcdzwvjssokfnea.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_KEY) {
    console.error("NO SERVICE KEY")
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function test() {
    const userId = '00000000-0000-0000-0000-000000000000';
    console.log("Inserting workspace for user:", userId)

    const { data: newWorkspace, error: createError } = await supabase
        .from('workspaces')
        .insert({
            user_id: userId,
            name: 'Test Workspace',
            genre: 'Sci-Fi'
        })
        .select()
        .single();

    if (createError) {
        console.error("Error:", createError)
    } else {
        console.log("Success:", newWorkspace)
    }
}

test()
