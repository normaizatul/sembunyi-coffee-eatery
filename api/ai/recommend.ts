type MenuData = {
  id: string;
  nameMs: string;
  nameEn: string;
  descriptionMs: string;
  descriptionEn: string;
  price: number;
  category: string;
  calories: number;
  prepTimeMinutes: number;
  allergens?: string[];
  isAvailable?: boolean;
  isPopular?: boolean;
  isSpicy?: boolean;
};

type ApiRequest = {
  method?: string;
  body?: { prompt?: string; language?: 'ms' | 'en'; menu?: MenuData[] };
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

function localAnswer(prompt: string, language: 'ms' | 'en', menu: MenuData[]) {
  const query = prompt.toLowerCase();
  const available = menu.filter((item) => item.isAvailable !== false);
  let dishes = available.filter((item) => {
    const searchable = `${item.nameMs} ${item.nameEn} ${item.descriptionMs} ${item.descriptionEn} ${item.category}`.toLowerCase();
    return query.split(/\s+/).some((word) => word.length > 3 && searchable.includes(word));
  });
  if (/bajet|budget|murah|under|bawah/.test(query)) dishes = available.filter((item) => item.price <= 15);
  if (/pedas|spicy|samyang/.test(query)) dishes = available.filter((item) => item.isSpicy);
  if (!dishes.length) dishes = available.filter((item) => item.isPopular);
  dishes = (dishes.length ? dishes : available).slice(0, 3);

  const names = dishes.map((item) => `${language === 'ms' ? item.nameMs : item.nameEn} (RM${item.price.toFixed(2)})`);
  return {
    text: language === 'ms'
      ? `Saya cadangkan ${names.join(', ')}. Untuk jawapan AI yang lebih terperinci, pemilik perlu mengaktifkan GEMINI_API_KEY di Vercel.`
      : `I recommend ${names.join(', ')}. For more detailed AI answers, the owner needs to enable GEMINI_API_KEY in Vercel.`,
    suggestedDishIds: dishes.map((item) => item.id),
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const prompt = req.body?.prompt?.trim() || '';
  const language = req.body?.language === 'en' ? 'en' : 'ms';
  const menu = Array.isArray(req.body?.menu) ? req.body.menu.slice(0, 150) : [];
  if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required' });
  if (!menu.length) return res.status(400).json({ success: false, message: 'Menu data is required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ success: true, ...localAnswer(prompt, language, menu), mode: 'local' });
  }

  try {
    const menuText = menu.filter((item) => item.isAvailable !== false)
      .map((item) => `ID ${item.id}: ${item.nameMs} / ${item.nameEn}, RM${item.price.toFixed(2)}, ${item.descriptionMs}, ${item.calories} kcal, preparation ${item.prepTimeMinutes} minutes, allergens: ${(item.allergens || []).join(', ') || 'not stated'}`)
      .join('\n');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: `You are SmartDine AI for Sembunyi Coffee & Eatery. Answer in ${language === 'ms' ? 'friendly Bahasa Melayu' : 'friendly English'}. Answer questions about the cafe menu, prices, ingredients, allergens, calories, preparation time, dietary preferences and food pairings using only the menu below. If information is not listed, say you do not have that information. Never invent ingredients, allergen safety or availability. Keep answers concise.\n\nMENU:\n${menuText}` }],
          },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 250 },
        }),
      }
    ).finally(() => clearTimeout(timeoutId));

    if (!geminiResponse.ok) {
      const details = await geminiResponse.text();
      throw new Error(`Gemini ${geminiResponse.status}: ${details.slice(0, 200)}`);
    }
    const payload = await geminiResponse.json() as any;
    const text = payload?.candidates?.[0]?.content?.parts?.map((part: any) => part.text || '').join('').trim();
    if (!text) throw new Error('Gemini returned an empty answer');
    const lower = text.toLowerCase();
    const suggestedDishIds = menu.filter((item) =>
      lower.includes(item.nameMs.toLowerCase()) || lower.includes(item.nameEn.toLowerCase())
    ).slice(0, 4).map((item) => item.id);

    return res.status(200).json({ success: true, text, suggestedDishIds, mode: 'gemini' });
  } catch (error) {
    console.error('Gemini request failed:', error);
    return res.status(200).json({ success: true, ...localAnswer(prompt, language, menu), mode: 'local_fallback' });
  }
}
