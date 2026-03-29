import { createAdminClient } from '@/lib/supabase/server';

export const maxDuration = 60; // Max duration for external generative requests

export async function POST(req: Request) {
    try {
        const { text, voiceId, userId } = await req.json();

        if (!text) {
            return new Response('Text is required', { status: 400 });
        }
        
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            return new Response('ELEVENLABS_API_KEY is not configured', { status: 500 });
        }

        // Default voice ID (Rachel) if none provided
        const targetVoiceId = voiceId || '21m00Tcm4TlvDq8ikWAM'; 

        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}?output_format=mp3_44100_128`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_monolingual_v1",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                }
            })
        });

        if (!res.ok) {
            const errorData = await res.text();
            console.error('ElevenLabs Error:', errorData);
            return new Response(`ElevenLabs API Error: ${errorData}`, { status: res.status });
        }

        const audioBuffer = await res.arrayBuffer();

        // Optional: Log token usage (1000 characters = ~1 token representation for billing)
        if (userId) {
            try {
                const adminSupabase = createAdminClient();
                await adminSupabase.from('api_usage_logs').insert({
                    user_id: userId,
                    model_name: 'elevenlabs-v1',
                    tokens_used: text.length,
                    cost_usd: (text.length / 1000) * 0.30 // Approx $0.30 per 1k characters
                });
            } catch (err) {
                console.error("Failed to log ElevenLabs usage:", err);
            }
        }

        return new Response(audioBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'ContentLength': audioBuffer.byteLength.toString(),
            }
        });

    } catch (error: any) {
        console.error('ElevenLabs Proxy Error:', error);
        return new Response(error.message || 'Internal Server Error', { status: 500 });
    }
}
