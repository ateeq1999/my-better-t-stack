import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

const apiKey = process.env.GEMINI_API_KEY || process.env.GEMIN_API_KEY || "";

if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set");
}

export const genAI = new GoogleGenerativeAI(apiKey);
export const fileManager = new GoogleAIFileManager(apiKey);

export const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});
