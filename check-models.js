require('dotenv').config({ path: '.env.local' });

async function checkModels() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: API Key nahi mili! '.env.local' file check karein.");
    return;
  }

  console.log("🔍 Google se models ki list mangwa raha hoon...");

  try {
    // Google API ko direct call kar ke list mangwa rahe hain
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
      console.error("❌ Google Error:", data.error.message);
      return;
    }

    console.log("\n✅ Aap ye Models use kar sakte hain:");
    console.log("-------------------------------------");
    
    // Sirf wo models dikhayenge jo 'generateContent' (chat) ke liye hain
    const chatModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    
    chatModels.forEach(model => {
      console.log(`Model Name: ${model.name}`); // Ye naam humein chahiye
      console.log(`Version: ${model.version}`);
      console.log("---");
    });

    if (chatModels.length === 0) {
      console.log("⚠️ Koi Chat Model available nahi hai via API.");
    }

  } catch (error) {
    console.error("❌ Script Error:", error.message);
  }
}

checkModels();