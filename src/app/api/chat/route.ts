import { createClient } from '@supabase/supabase-js';
import Groq from "groq-sdk";
import { pipeline } from '@xenova/transformers';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getContext(message: string) {
  const generateEmbedding = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const output = await generateEmbedding(message, { pooling: 'mean', normalize: true });
  const embedding = Array.from(output.data);

  const { data: documents } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
match_threshold: 0.1,
    match_count: 5,
  });
console.log("Database Results:", documents);
  return documents?.map((doc: any) => doc.content).join('\n\n') || '';
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const context = await getContext(message);

    const prompt = `
      You are a helpful assistant for a website.
      Use the following CONTEXT to answer the user's question.
      If the answer is not in the context, simply say "I don't know based on the website info."

      CONTEXT:
      ${context}

      USER QUESTION: ${message}
    `;

    // CHANGE: Naya Model use kar rahe hain
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
    });

    const reply = chatCompletion.choices[0]?.message?.content || "No response";

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Error Detail:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}