import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" }); // Google ka halka model

// ✅ Sidat.net Data
const websiteData = [
  "Sidat Technologies & Digital is a global creative innovation company.",
  "We create smart, scalable digital solutions.",
  "Services: Web Design, Custom Development, Mobile Apps (iOS/Android).",
  "We also offer Digital Marketing, SEO, and UI/UX Design.",
  "Our AI Hub provides Artificial Intelligence solutions.",
  "Business Process Outsourcing (BPO) services are available.",
  "Contact us for projects in Pakistan and globally.",
  "Client Testimonial: 'Sidat Technologies exceeded our expectations' - Humaira Bourne."
];

export async function GET() {
  try {
    // 1. Purana data saaf karein
    await supabase.from('documents').delete().neq('id', 0);

    const records = [];

    // 2. Google se Vectors banwayen (Fast & Cloud-based)
    for (const text of websiteData) {
      const result = await model.embedContent(text);
      const embedding = result.embedding.values;
      
      records.push({
        content: text,
        embedding: embedding
      });
    }

    // 3. Database mein save
    const { error } = await supabase.from('documents').insert(records);
    if (error) throw error;

    return NextResponse.json({ message: "Data Uploaded with Google Embeddings!", count: records.length });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}