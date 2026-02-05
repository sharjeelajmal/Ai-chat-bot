import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { pipeline } from '@xenova/transformers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ✅ Yahan maine Sidat.net ka asal data daal diya hai
const websiteData = [
  // --- HOME PAGE DATA ---
  "Sidat Technologies & Digital is a global creative innovation company.",
  "We are your trusted partner in creating smart, scalable, and future-ready digital solutions.",
  "Our main services include Technology, AI Hub, Digital Marketing, Creative Solutions, and Business Process Outsourcing.",
  "We help businesses stay ahead with innovative and intelligent tech solutions.",
  
  // --- SERVICES DATA ---
  "Web Designing: We design visually engaging and mobile-responsive websites that tell your brand story.",
  "Custom Development: We build custom websites, iOS, Android, and hybrid apps that solve real-world problems.",
  "Mobile App Development: We design and develop mobile solutions for iOS and Android to scale your business.",
  "Digital Marketing: We support brands with data-driven strategies, creative content, and targeted campaigns.",
  "Creative Solutions: We provide full-scale creative media services to captivate and convert your audience.",
  "Business Process Outsourcing (BPO): Sidat gives you reliable virtual assistance and back-office support to boost productivity.",
  "AI Hub: We provide Artificial Intelligence solutions to modernize your business.",
  
  // --- COMPANY / ABOUT US DATA ---
  "Vision: To be a global leader in delivering innovative and human-centric digital solutions.",
  "Mission: To solve real-world business challenges through innovative technologies and tailored strategies.",
  "Our Process: We start with Discovery & Strategy, move to Concept & Planning, then Design & UX, and finally Development & Implementation.",
  "Client Testimonial: 'Sidat Technologies has exceeded our expectations. Their website management and social media services have been instrumental in our growth.' - Humaira Bourne.",
  "We are committed to excellence, transparency, and measurable results in every project.",
  
  // --- CONTACT INFO ---
  "You can contact Sidat Technologies for any digital project or consultation.",
  "We serve clients globally including Pakistan and international markets."
];

export async function GET() {
  try {
    // 1. Purana data delete karein
    await supabase.from('documents').delete().neq('id', 0);

    // 2. Local AI Model load karein
    const generateEmbedding = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    const records = [];

    // 3. Har line ka vector banayein
    for (const text of websiteData) {
      const output = await generateEmbedding(text, { pooling: 'mean', normalize: true });
      const embedding = Array.from(output.data); 
      
      records.push({
        content: text,
        embedding: embedding
      });
    }

    // 4. Database mein save karein
    const { error } = await supabase.from('documents').insert(records);

    if (error) throw error;

    return NextResponse.json({ 
      message: "Sidat.net Data Successfully Uploaded!", 
      count: records.length 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}