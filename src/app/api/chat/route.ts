import { createClient } from '@supabase/supabase-js';
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
const embeddingModel = googleAI.getGenerativeModel({ model: "text-embedding-004" });

async function getContext(message: string) {
  const result = await embeddingModel.embedContent(message);
  const embedding = result.embedding.values;

  const { data: documents } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.0, // Data aanay do, AI khud filter karega
    match_count: 3,
  });

  return documents?.map((doc: any) => doc.content).join('\n\n') || '';
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const context = await getContext(message);

    // --- CHANGE: STRICT PROMPT ---
    const prompt = `
      You are a strictly professional AI assistant for 'Sidat Technologies'.
      
      STRICT RULES:
      1. Use ONLY the provided CONTEXT to answer.
      2. If the answer is NOT in the CONTEXT, you MUST say: "I am sorry, I can only answer questions related to Sidat Technologies."
      3. DO NOT use your general knowledge (e.g., do not explain cities, cooking, or world facts).
      4. Keep answers short (under 2 sentences).

      CONTEXT:
      ${context}

      USER QUESTION: ${message}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0, // 0 Temperature = No Creativity (Sirf Facts)
    });

    const reply = chatCompletion.choices[0]?.message?.content || "No response";
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}