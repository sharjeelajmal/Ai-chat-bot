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
  // 1. User ke sawal ka vector banaya
  const result = await embeddingModel.embedContent(message);
  const embedding = result.embedding.values;

  // 2. Database mein match dhoonda
  const { data: documents } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.3, // Thora strict rakha hai taake har cheez match na ho
    match_count: 3,       // Sirf top 3 results layen
  });

  return documents?.map((doc: any) => doc.content).join('\n\n') || '';
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const context = await getContext(message);

    // --- CHANGE 1: STRICT GATEKEEPER (Chowkidaar) ---
    // Agar database mein milti julti koi cheez nahi mili, to AI se mat pucho.
    // Seedha mana kar do.
    if (!context || context.length === 0) {
      return NextResponse.json({ 
        reply: "I'm sorry, I can only answer questions related to Sidat Technologies services." 
      });
    }

    // --- CHANGE 2: SHORT ANSWER INSTRUCTION ---
    const prompt = `
      You are a helpful assistant for Sidat Technologies.
      
      INSTRUCTIONS:
      1. Use ONLY the Context below.
      2. Keep your answer VERY SHORT (maximum 2 sentences).
      3. If the answer is not in the context, say "I don't know".
      
      CONTEXT:
      ${context}
      
      USER QUESTION: ${message}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0, // 0 ka matlab: Tukka mat lagao, bilkul exact raho
    });

    const reply = chatCompletion.choices[0]?.message?.content || "No response";
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}