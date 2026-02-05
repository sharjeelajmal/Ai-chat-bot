import { createClient } from '@supabase/supabase-js';
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// DO NOT USE 'Local AI' (Xenova) - It crashes Vercel
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
const embeddingModel = googleAI.getGenerativeModel({ model: "text-embedding-004" });

async function getContext(message: string) {
  // 1. Google se Vector banwaya (Fast)
  const result = await embeddingModel.embedContent(message);
  const embedding = result.embedding.values;

  // 2. Supabase mein dhoonda
  const { data: documents } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.4, 
    match_count: 5,
  });

  return documents?.map((doc: any) => doc.content).join('\n\n') || '';
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const context = await getContext(message);

    const prompt = `
      You are a helpful assistant for Sidat Technologies.
      Use this context to answer:
      ${context}
      
      User Question: ${message}
    `;

    // 3. Jawab Groq se liya (Super Fast)
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
    });

    const reply = chatCompletion.choices[0]?.message?.content || "No response";
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}