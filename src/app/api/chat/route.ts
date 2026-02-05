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
    match_threshold: 0.0, // CHANGE: 0.0 kar diya (Jo bhi miley le aao)
    match_count: 3,
  });

  // Debugging ke liye: Console mein check karein ke kya mila
  console.log("Found in DB:", documents);

  return documents?.map((doc: any) => doc.content).join('\n\n') || '';
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const context = await getContext(message);

    // CHANGE: Humne wo "if (!context)" wala block DELETE kar diya.
    // Ab ye kabhi bhi "I'm sorry" wala error khud se nahi dega.

    const prompt = `
      You are a helpful assistant for Sidat Technologies.
      
      INSTRUCTIONS:
      1. Use the Context below to answer.
      2. If the context is empty, try to answer politely based on general knowledge about tech companies, but mention you are not sure.
      3. Keep answer under 2 sentences.
      
      CONTEXT:
      ${context}
      
      USER QUESTION: ${message}
    `;

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