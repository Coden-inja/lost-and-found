/**
 * AI Auto-Tagging helper function.
 * Primary: Google Gemini 2.0 Flash / 1.5 Flash
 * Fallback: Groq API (Qwen 3.6 27B / Llama 3.3)
 * Never throws — returns empty array on failure or timeout.
 */

// Helper to sanitize, deduplicate, and limit AI tag length/count
function sanitizeTags(rawOutput) {
  if (!rawOutput) return [];
  const rawList = rawOutput.split(/[,\n]/);
  const cleaned = rawList
    .map(tag => tag.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9\s]+$/g, '').trim().toLowerCase())
    .filter(tag => tag.length >= 2 && tag.length <= 20 && !tag.includes('keyword'));
  const unique = Array.from(new Set(cleaned));
  return unique.slice(0, 5); // Max 5 concise tags
}

export async function generateTagsFromImage(base64Data, mimeType = 'image/jpeg') {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!base64Data) return [];

  // Strip prefix if base64Data includes data URL header (data:image/png;base64,...)
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s safety timeout

  // 1. TRY GEMINI API ENDPOINTS
  if (geminiKey) {
    const models = ['gemini-2.0-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash-latest'];

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: 'Analyze this image of a lost or found item. Return 4 to 5 short single-word or 2-word comma-separated keywords (e.g. black, leather, wallet, headphones). Output ONLY short comma-separated keywords and nothing else.'
                    },
                    {
                      inline_data: {
                        mime_type: mimeType,
                        data: cleanBase64
                      }
                    }
                  ]
                }
              ]
            })
          }
        );

        if (response.ok) {
          clearTimeout(timeoutId);
          const data = await response.json();
          const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (textOutput) {
            const tags = sanitizeTags(textOutput);
            if (tags.length > 0) return tags;
          }
        }
      } catch (error) {
        console.warn(`Gemini model ${model} error:`, error);
      }
    }
  }

  // 2. FALLBACK TO GROQ API IF GEMINI IS RATE LIMITED OR FAILS
  if (groqKey) {
    try {
      const groqModels = ['qwen/qwen3.6-27b', 'llama-3.3-70b-versatile', 'llama3-8b-8192'];

      for (const groqModel of groqModels) {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: groqModel,
            messages: [
              {
                role: 'user',
                content: 'List 4 to 5 short single-word or 2-word comma-separated keywords for a lost item image (e.g. black, leather, wallet, headphones). Output ONLY short comma-separated keywords.'
              }
            ],
            temperature: 0.5,
            max_completion_tokens: 100
          })
        });

        if (groqRes.ok) {
          clearTimeout(timeoutId);
          const groqData = await groqRes.json();
          const groqText = groqData?.choices?.[0]?.message?.content || '';
          if (groqText) {
            const tags = sanitizeTags(groqText);
            if (tags.length > 0) return tags;
          }
        }
      }
    } catch (err) {
      console.warn('Groq fallback API error:', err);
    }
  }

  clearTimeout(timeoutId);
  return [];
}
