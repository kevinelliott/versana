import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/workspace';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Forward the user straight to their destination using a temporary 302
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Fallback to error or home page
  return NextResponse.redirect(`${origin}/login?error=auth-failure`);
}
