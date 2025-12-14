import { GoogleGenAI } from "@google/genai";
import { GeneratedResult } from "../types";

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export const checkHasApiKey = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    return await window.aistudio.hasSelectedApiKey();
  }
  return false;
};

export const promptSelectApiKey = async (): Promise<void> => {
  if (window.aistudio && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
  } else {
    console.warn("AI Studio API is not available in this environment.");
  }
};

export const generateImageContent = async (
  prompt: string,
  characterFile: File | null,
  referenceFile: File | null,
  aspectRatio: string = "1:1",
  resolution: string = "1K"
): Promise<GeneratedResult> => {
  
  // Always create a new instance to get the latest injected key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts: any[] = [];

  // Add text prompt
  if (prompt) {
    parts.push({ text: prompt });
  }

  // Add Character Image
  if (characterFile) {
    const base64Char = await fileToBase64(characterFile);
    parts.push({
      inlineData: {
        mimeType: characterFile.type,
        data: base64Char
      }
    });
    // Add a text hint for the model to understand the role of this image
    parts.push({ text: "[The image above is the Character Reference]" });
  }

  // Add Structure/Style Reference Image
  if (referenceFile) {
    const base64Ref = await fileToBase64(referenceFile);
    parts.push({
      inlineData: {
        mimeType: referenceFile.type,
        data: base64Ref
      }
    });
     // Add a text hint for the model
     parts.push({ text: "[The image above is the Style/Structure Reference]" });
  }

  if (parts.length === 0) {
    throw new Error("Please provide a prompt or an image.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          imageSize: resolution, 
          aspectRatio: aspectRatio,
        }
      },
    });

    const result: GeneratedResult = {};

    // Parse response for image and text
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          // Assume PNG if not specified, but usually mimeType is present
          const mime = part.inlineData.mimeType || 'image/png';
          result.imageUrl = `data:${mime};base64,${base64EncodeString}`;
        } else if (part.text) {
          result.text = part.text;
        }
      }
    }

    return result;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};