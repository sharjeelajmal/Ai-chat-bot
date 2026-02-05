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
    match_threshold: 0.2, // Thora sa filter rakhein taake bilkul kachra na aaye
    match_count: 3,
  });

  return documents?.map((doc: any) => doc.content).join('\n\n') || '';
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const context = await getContext(message);

    const prompt = `
      You are a helpful assistant for 'Sidat Technologies'.
      
      IMPORTANT RULES:
      1. Assume that "you", "we", or "the company" refers to 'Sidat Technologies'.
      2. Use the CONTEXT below to answer.
      3. If the answer is in the context, answer directly and professionally.
      4. If the question is completely unrelated (e.g., about cities, food, general knowledge) and NOT in the context, say: "I am sorry, I can only answer questions related to Sidat Technologies."
      5. Keep your answer SHORT (maximum 2 sentences).

      CONTEXT:
      ${context}

      USER QUESTION: ${message}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1, // Thora sa barhaya taake wo "You" ko samajh sake
    });

    const reply = chatCompletion.choices[0]?.message?.content || "No response";
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}