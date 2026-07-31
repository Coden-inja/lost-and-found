// Test Script for Smart Campus Lost & Found System
// Reads credentials dynamically from .env file
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve('.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let value = match[2] || '';
        if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        env[match[1]] = value.trim();
      }
    });
  }
  return env;
}

const env = loadEnv();
const GEMINI_KEY = process.env.VITE_GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;
const GROQ_KEY = process.env.VITE_GROQ_API_KEY || env.VITE_GROQ_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || 'https://wdpduhwnkfsqmkhjppsq.supabase.co';
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

async function testAll() {
  console.log('====================================================');
  console.log('🧪 SMART CAMPUS LOST & FOUND - SERVICE HEALTH CHECK');
  console.log('====================================================\n');

  // 1. LOCAL DEV SERVER
  console.log('1️⃣  TESTING LOCAL DEV SERVER (http://localhost:5173/)...');
  try {
    const res = await fetch('http://localhost:5173/');
    console.log(`   ✅ Local Server Status: ${res.status} ${res.statusText}`);
  } catch (err) {
    console.error(`   ❌ Local Server Error: ${err.message}`);
    console.log('   💡 Make sure to run "npm run dev" in another terminal tab.');
  }

  // 2. SUPABASE DB REST API
  console.log('\n2️⃣  TESTING SUPABASE REST DATABASE API...');
  try {
    const url = `${SUPABASE_URL}/rest/v1/item_reports?select=id,report_type,item_name,category,status&limit=5`;
    const res = await fetch(url, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });
    console.log(`   ✅ Supabase Status: ${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log(`   📊 Seed Items Returned: ${data.length}`);
    if (data.length > 0) {
      console.log('   📦 Sample Record:', JSON.stringify(data[0]));
    }
  } catch (err) {
    console.error(`   ❌ Supabase REST Error: ${err.message}`);
  }

  // 3. GEMINI AI MODELS TEST
  console.log('\n3️⃣  TESTING GEMINI AI MODELS...');
  if (GEMINI_KEY) {
    const testModels = ['gemini-2.0-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash-latest'];

    for (const model of testModels) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: 'Respond with 3 keywords describing a lost headphone' }]
              }
            ]
          })
        });
        console.log(`   🤖 Gemini Model [${model}] Status: ${res.status} ${res.statusText}`);
        if (res.ok) {
          const result = await res.json();
          console.log(`      Output: ${result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()}`);
          break;
        }
      } catch (err) {
        console.error(`   ❌ Gemini ${model} Error: ${err.message}`);
      }
    }
  } else {
    console.log('   ⚠️  Gemini Key not found in .env');
  }

  // 4. GROQ API FALLBACK TEST
  console.log('\n4️⃣  TESTING GROQ API FALLBACK...');
  if (GROQ_KEY) {
    const groqModels = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'qwen-2.5-32b'];

    for (const groqModel of groqModels) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: groqModel,
            messages: [
              {
                role: 'user',
                content: 'List 5 comma separated keywords for a lost black headphone'
              }
            ],
            temperature: 0.6,
            max_completion_tokens: 100
          })
        });
        console.log(`   ⚡ Groq Model [${groqModel}] Status: ${groqRes.status} ${groqRes.statusText}`);
        if (groqRes.ok) {
          const groqData = await groqRes.json();
          console.log(`      Output: ${groqData?.choices?.[0]?.message?.content?.trim()}`);
          break;
        }
      } catch (err) {
        console.error(`   ❌ Groq Model ${groqModel} Error: ${err.message}`);
      }
    }
  } else {
    console.log('   ⚠️  Groq Key not found in .env');
  }

  console.log('\n====================================================\n');
}

testAll();
