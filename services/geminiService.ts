
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async *streamEducationalResponse(
    prompt: string, 
    subjectName: string = "general", 
    imageData?: string,
    audioData?: string,
    languageName: string = "Arabic"
  ) {
    try {
      const systemInstruction = `
        You are "EduAI Academy", a smart and friendly educational assistant.
        MANDATORY: You MUST respond in ${languageName}.
        Task: Explain educational concepts to students step-by-step.
        Current Subject: ${subjectName}.
        
        Guidelines:
        1. Start with an encouraging greeting.
        2. Use clear and simple language appropriate for students.
        3. If audio or image is provided, analyze it thoroughly to help the student.
        4. For math, explain steps clearly.
        5. Add practical real-life examples.
        6. Use Markdown (headers, lists, tables).
        7. At the end, provide 2 short exercises for the student.
      `;

      const parts: any[] = [{ text: prompt }];
      
      if (imageData) {
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: imageData.split(',')[1]
          }
        });
      }

      if (audioData) {
        parts.push({
          inlineData: {
            mimeType: "audio/webm", // Common browser recording format
            data: audioData.split(',')[1]
          }
        });
      }

      const stream = await this.ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: { parts },
        config: { systemInstruction },
      });

      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        yield c.text;
      }
    } catch (error) {
      console.error("Gemini Stream Error:", error);
      throw error;
    }
  }
}

export const gemini = new GeminiService();
