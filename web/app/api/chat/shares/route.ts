import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { message, shares } = await req.json();

        // Construct context only if needed by n8n, but typically we send raw data
        const payload = {
            message,
            shares,
            timestamp: new Date().toISOString(),
        };

        const n8nUrl = process.env.N8N_WEBHOOK_URL;

        if (!n8nUrl) {
            throw new Error('N8N_WEBHOOK_URL is not defined');
        }

        const n8nResponse = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!n8nResponse.ok) {
            throw new Error(`n8n webhook failed with status: ${n8nResponse.status}`);
        }

        const data = await n8nResponse.json();
        // Assuming n8n returns an object like { reply: "..." } or { output: "..." }
        // Adjust this based on your actual n8n workflow output node
        const reply = data.reply || data.output || data.messaging || "Received response from n8n";

        return NextResponse.json({ reply });

    } catch (error: any) {
        console.error('Error in Shares AI Chat (n8n):', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to connect to AI service' },
            { status: 500 }
        );
    }
}
