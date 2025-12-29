
import { GoogleGenAI, Type, Modality } from "https://esm.sh/@google/genai@1.34.0";

// Fix: Simplified initialization according to Google GenAI SDK guidelines
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function rewriteNews(rawContent: string): Promise<{ title: string; content: string; summary: string }> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `यस समाचारलाई व्यावसायिक र आकर्षक नेपाली भाषामा पुन: लेख्नुहोस्। शीर्षक र सारांश पनि समावेश गर्नुहोस्। JSON ढाँचामा दिनुहोस्।\n\nContent: ${rawContent}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          summary: { type: Type.STRING },
        },
        required: ["title", "content", "summary"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function generateAudio(text: string): Promise<string | null> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `यस समाचारलाई सुस्त र स्पष्ट नेपाली स्वरमा वाचन गर्नुहोस्: ${text.substring(0, 1000)}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/pcm;base64,${base64Audio}`;
    }
    return null;
  } catch (error) {
    console.error("Audio generation failed", error);
    return null;
  }
}
