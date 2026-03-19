import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface Announcement {
  id: number;
  title: string;
  date: string;
  message: string;
  type: "news" | "celebration" | "alert";
}

export interface Highlight {
  id: number;
  user: string;
  status: string;
  time: string;
}

export interface DailyInsight {
  quote: string;
  author: string;
  tip: string;
}

export const generateDailyContent = async (currentDate: string, users: string[]) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate daily company content for Technotask MIS Hub for the date ${currentDate}.
    The company is based in Mysore and Bangalore, specializing in MIS (Management Information Systems) processing for clients like Amazon, Flipkart, and Zomato.
    
    Users currently in the system: ${users.join(", ")}.
    
    Generate:
    1. 3-4 professional announcements.
    2. 4-5 team highlights (mentioning some of the users).
    3. A daily motivational quote and a productivity tip.
    4. A birthday greeting if applicable (pick one user at random if no real birthday, but make it sound realistic).
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          announcements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                title: { type: Type.STRING },
                date: { type: Type.STRING },
                message: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["news", "celebration", "alert"] }
              },
              required: ["id", "title", "date", "message", "type"]
            }
          },
          highlights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                user: { type: Type.STRING },
                status: { type: Type.STRING },
                time: { type: Type.STRING }
              },
              required: ["id", "user", "status", "time"]
            }
          },
          insight: {
            type: Type.OBJECT,
            properties: {
              quote: { type: Type.STRING },
              author: { type: Type.STRING },
              tip: { type: Type.STRING }
            },
            required: ["quote", "author", "tip"]
          },
          birthday: {
            type: Type.OBJECT,
            properties: {
              userName: { type: Type.STRING },
              message: { type: Type.STRING }
            },
            required: ["userName", "message"]
          }
        },
        required: ["announcements", "highlights", "insight", "birthday"]
      }
    }
  });

  return JSON.parse(response.text);
};
