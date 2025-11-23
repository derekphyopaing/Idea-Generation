import { GoogleGenAI, Chat, Type, Schema } from "@google/genai";
import { BMCData, Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Initial System Instruction for the Interviewer
const INTERVIEWER_INSTRUCTION = `
You are an experienced, friendly, and professional business consultant speaking Burmese (Myanmar language).
Your goal is to interview the user to understand their business idea fully.

**CRITICAL: GUIDE THE USER**
Users often struggle to answer open-ended questions.
To make it easier for them, for **EVERY** question you ask, you **MUST** provide 3-4 specific **EXAMPLES** or **OPTIONS** relevant to that question.
Format these examples clearly (e.g., as a list) so the user can simply choose one or get inspired.

**Interview Roadmap (Ask one question at a time)**:

1. **Business Idea**: Ask what business they want to start.
   *Examples to show*: (e.g., Online Clothing Shop, Coffee Shop, Car Rental Service, Grocery Store?)

2. **Target Customers**: Ask who is the main customer.
   *Examples to show*: (e.g., University Students, Office Workers, Housewives, High-income individuals?)

3. **Value Proposition**: Ask why customers should buy from them (Unique Selling Point).
   *Examples to show*: (e.g., Lowest Price, Premium Quality, Fast Delivery, 24/7 Customer Service?)

4. **Revenue Models**: Ask how they will make money.
   *Examples to show*: (e.g., Selling products directly, Service fees, Monthly Subscription, Commission?)

5. **Channels**: Ask how they will reach customers.
   *Examples to show*: (e.g., Facebook Page & Ads, TikTok Shop, Physical Storefront, Agent Network?)

6. **Team & Operations**: Ask about the team size and setup.
   *Examples to show*: (e.g., Solo Founder (1 person), Family Business, Small Team (3-5 staff)?)

7. **Cost Structure**: Ask about major initial expenses.
   *Examples to show*: (e.g., Shop Rent & Decoration, Stock Inventory, Marketing Costs, Staff Salaries?)

**Rules**:
- Speak in warm, natural, and polite Burmese.
- Ask **ONE** question at a time.
- Always include the **Examples/Options** part in your response.
- Be encouraging.
`;

export const createInterviewChat = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: INTERVIEWER_INSTRUCTION,
    },
  });
};

// Schema for BMC
const bmcSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    keyPartners: { type: Type.ARRAY, items: { type: Type.STRING } },
    keyActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
    keyResources: { type: Type.ARRAY, items: { type: Type.STRING } },
    valuePropositions: { type: Type.ARRAY, items: { type: Type.STRING } },
    customerRelationships: { type: Type.ARRAY, items: { type: Type.STRING } },
    channels: { type: Type.ARRAY, items: { type: Type.STRING } },
    customerSegments: { type: Type.ARRAY, items: { type: Type.STRING } },
    costStructure: { type: Type.ARRAY, items: { type: Type.STRING } },
    revenueStreams: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["keyPartners", "keyActivities", "keyResources", "valuePropositions", "customerRelationships", "channels", "customerSegments", "costStructure", "revenueStreams"]
};

export const generateSummaryNote = async (history: Message[]): Promise<string> => {
  const context = history.map(m => `${m.role === 'user' ? 'User' : 'Consultant'}: ${m.text}`).join('\n');
  const prompt = `
Based on the following interview transcript, write a concise, well-structured summary note in Burmese that the user can copy and save.
The note should capture the core essence of their business idea.
Transcript:
${context}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  
  return response.text || "အချက်အလက်များကို အကျဉ်းချုပ်၍ မရနိုင်ပါ။ (Could not generate summary)";
};

export const generateBMC = async (history: Message[]): Promise<BMCData | null> => {
  const context = history.map(m => `${m.role === 'user' ? 'User' : 'Consultant'}: ${m.text}`).join('\n');
  const prompt = `
Based on the following interview transcript, populate a Business Model Canvas in Burmese.
Return ONLY the JSON object matching the schema.
Transcript:
${context}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: bmcSchema
      }
    });
    
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as BMCData;
  } catch (e) {
    console.error("Error generating BMC:", e);
    return null;
  }
};

export const generateOnePagePlan = async (history: Message[]): Promise<string> => {
  const context = history.map(m => `${m.role === 'user' ? 'User' : 'Consultant'}: ${m.text}`).join('\n');
  const prompt = `
Based on the interview transcript below, write a professional "One Page Business Plan" in Burmese.
Use Markdown formatting.
Include sections for:
- Executive Summary (အလုပ်အမှုဆောင် အကျဉ်းချုပ်)
- Business Description (စီးပွားရေးလုပ်ငန်း ဖော်ပြချက်)
- Marketing Strategy (ဈေးကွက်မဟာဗျူဟာ)
- Operational Plan (လုပ်ငန်းလည်ပတ်မှု အစီအစဉ်)

Transcript:
${context}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text || "";
};

export const generateFinancialPlan = async (history: Message[]): Promise<string> => {
  const context = history.map(m => `${m.role === 'user' ? 'User' : 'Consultant'}: ${m.text}`).join('\n');
  const prompt = `
Based on the interview transcript below, create a "Business Plan with Financial Projections" in Burmese.
Use Markdown formatting.
You MUST include a table for "3-Year Financial Projection (Estimated)" (၃ နှစ်စာ ခန့်မှန်း ဘဏ္ဍာရေးအခြေအနေ).
The table should include rows for Revenue, COGS, Gross Margin, Operating Expenses, and Net Profit.
Since this is a new business, use realistic ESTIMATES based on the industry type mentioned in the transcript.
Clearly state that these are estimates.

Transcript:
${context}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text || "";
};

export const generateStrategicPlan = async (history: Message[]): Promise<string> => {
  const context = history.map(m => `${m.role === 'user' ? 'User' : 'Consultant'}: ${m.text}`).join('\n');
  const prompt = `
Based on the interview transcript below, develop a "Strategic Plan" (မဟာဗျူဟာ စီမံကိန်း) in Burmese.
Use Markdown formatting.
Include:
- Vision & Mission Statement (မျှော်မှန်းချက် နှင့် လုပ်ငန်းစဉ်)
- SWOT Analysis (အားသာချက်၊ အားနည်းချက်၊ အခွင့်အလမ်း၊ ခြိမ်းခြောက်မှုများ)
- Strategic Objectives (Short-term vs Long-term Goals)
- Key Competitive Advantage (ပြိုင်ဘက်များနှင့် ယှဉ်လျှင် အားသာချက်)

Transcript:
${context}
`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text || "";
};

export const generateGTMStrategy = async (history: Message[]): Promise<string> => {
  const context = history.map(m => `${m.role === 'user' ? 'User' : 'Consultant'}: ${m.text}`).join('\n');
  const prompt = `
Based on the interview transcript below, create a "Go-To-Market (GTM) Strategy" (ဈေးကွက်ဝင်ရောက်ရေး မဟာဗျူဟာ) in Burmese.
Use Markdown formatting.
Include:
- Market Entry Strategy (ဈေးကွက်စတင်ဖောက်ထွင်းမည့် နည်းလမ်း)
- Pricing Strategy (ဈေးနှုန်းသတ်မှတ်ခြင်း မဟာဗျူဟာ)
- Distribution Strategy (ဖြန့်ဖြူးရေး လမ်းကြောင်းများ)
- Launch Plan (လုပ်ငန်းစတင်မိတ်ဆက်ခြင်း အစီအစဉ်)

Transcript:
${context}
`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text || "";
};

export const generateMarketingPlan = async (history: Message[]): Promise<string> => {
  const context = history.map(m => `${m.role === 'user' ? 'User' : 'Consultant'}: ${m.text}`).join('\n');
  const prompt = `
Based on the interview transcript below, create a "1-Page Marketing Plan" (စာမျက်နှာတစ်မျက်နှာ ဈေးကွက်အစီအစဉ်) in Burmese.
Use Markdown formatting.
Include:
- Target Market (ပစ်မှတ်ထားသော ဖောက်သည်များ)
- Key Marketing Message (USP) (အဓိက ပေးလိုသော သတင်းစကား)
- Marketing Channels & Tactics (အသုံးပြုမည့် မီဒီယာနှင့် နည်းလမ်းများ)
- Estimated Marketing Budget (ခန့်မှန်း ဈေးကွက်စရိတ်)
- 12-Month Calendar Overview (၁ နှစ်စာ အကြမ်းဖျင်း အချိန်ဇယား)

Transcript:
${context}
`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text || "";
};

export const generateHRPlan = async (history: Message[]): Promise<string> => {
  const context = history.map(m => `${m.role === 'user' ? 'User' : 'Consultant'}: ${m.text}`).join('\n');
  const prompt = `
Based on the interview transcript below, create a "Human Resources Plan" (လူ့စွမ်းအားအရင်းအမြစ် စီမံခန့်ခွဲမှု အစီအစဉ်) in Burmese.
Use Markdown formatting.
Include:
- Organizational Structure / Org Chart (ဖွဲ့စည်းပုံ - List format)
- Key Roles & Responsibilities (အဓိက တာဝန်ဝတ္တရားများ)
- Hiring Strategy (ဝန်ထမ်းခေါ်ယူရေး မဟာဗျူဟာ)
- Training & Development Plans (ဝန်ထမ်းလေ့ကျင့်ပျိုးထောင်ရေး)
- Company Culture (လုပ်ငန်းခွင် ယဉ်ကျေးမှု)

Transcript:
${context}
`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text || "";
};

export const generateOpsPlan = async (history: Message[]): Promise<string> => {
  const context = history.map(m => `${m.role === 'user' ? 'User' : 'Consultant'}: ${m.text}`).join('\n');
  const prompt = `
Based on the interview transcript below, create an "Operational Plan" (လုပ်ငန်းလည်ပတ်မှု အစီအစဉ်) in Burmese.
Use Markdown formatting.
Include:
- Operational Workflow (လုပ်ငန်းစဉ် အဆင့်ဆင့်)
- Location & Facilities (တည်နေရာနှင့် အဆောက်အဦ လိုအပ်ချက်)
- Equipment & Technology (စက်ပစ္စည်းနှင့် နည်းပညာ)
- Supply Chain & Inventory Management (ကုန်ကြမ်းနှင့် ကုန်ပစ္စည်းထိန်းသိမ်းမှု)
- Quality Control Standards (အရည်အသွေး ထိန်းချုပ်မှု)

Transcript:
${context}
`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text || "";
};