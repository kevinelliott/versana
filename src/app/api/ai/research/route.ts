import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: "Missing query" }, { status: 400 });
        }

        const { object } = await generateObject({
            model: google('gemini-1.5-pro'),
            schema: z.object({
                results: z.array(z.object({
                    title: z.string().describe("The headline of the research finding."),
                    source: z.string().describe("The domain or organization name of the source (e.g. NASA.gov, Nature, Wikipedia)."),
                    snippet: z.string().describe("A concise 2-sentence summary of the factual finding."),
                    url: z.string().url().describe("A plausible URL for the source.")
                })).min(1).max(3).describe("A list of relevant research results.")
            }),
            system: "You are a highly intelligent semantic search engine and researcher for an author. The author is writing a book and needs accurate, real-world information. Search your broad knowledge base for the exact answer to their query and synthesize it into 2-3 highly distinct and detailed search results. Format as professional research citations.",
            prompt: `Research Query: "${query}"`,
        });

        return NextResponse.json(object);
    } catch (err: any) {
        console.error("Research API Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
