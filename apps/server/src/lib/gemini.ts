import { GoogleGenAI } from '@google/genai';


const apiKey = process.env.GEMINI_API_KEY || process.env.GEMIN_API_KEY || "";

if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set");
}

export const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY, // Or directly provide your API key
});

export async function createFileStore(name: string) {
    const createStoreOp = await genAI.fileSearchStores.create({
        config: {
            displayName: name,
        }
    });

    return createStoreOp;
}

export async function uploadFile(storeName: string, filePath: string, fileContent: Buffer, mimeType: string) {
    const uploadOperation = await genAI.fileSearchStores.uploadToFileSearchStore({
        config: {
            displayName: filePath,
            mimeType: mimeType,
        },
        file: fileContent.toString('base64'),
        fileSearchStoreName: storeName,
    });

    return uploadOperation;
}
