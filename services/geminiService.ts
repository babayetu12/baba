import { GoogleGenAI } from "@google/genai";
import { LOCAL_STORAGE_KEY_QUOTE } from '../constants';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
    if (aiClient) {
        return aiClient;
    }
    
    // FIX: Per Gemini API guidelines, the API key must be obtained from process.env.API_KEY.
    // This also resolves the TypeScript error "Property 'env' does not exist on type 'ImportMeta'".
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        // This error will be visible in your browser's developer console.
        // FIX: Updated error message to reflect the new environment variable.
        throw new Error("API_KEY environment variable is not set. Please set it and restart the server.");
    }
    
    aiClient = new GoogleGenAI({ apiKey });
    return aiClient;
}

const FALLBACK_QUOTE = "Believe you can and you're halfway there. - Theodore Roosevelt";

export async function generateInspirationalQuote(): Promise<string> {
    try {
        const cachedItem = localStorage.getItem(LOCAL_STORAGE_KEY_QUOTE);
        if (cachedItem) {
            const { quote, timestamp } = JSON.parse(cachedItem);
            const isStale = (Date.now() - timestamp) > 24 * 60 * 60 * 1000; // Stale after 24 hours
            if (!isStale) {
                return quote;
            }
        }
    } catch (error) {
        console.error("Error reading cached quote:", error);
    }

    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Generate a short, inspirational quote for a student who is about to start studying. The quote should be motivating and concise. No attributions.',
        });
        
        const newQuote = response.text.trim();
        
        const newCachedItem = {
            quote: newQuote,
            timestamp: Date.now(),
        };
        localStorage.setItem(LOCAL_STORAGE_KEY_QUOTE, JSON.stringify(newCachedItem));
        
        return newQuote;
    } catch (error) {
        console.error("Error generating quote with Gemini API:", error);
        return FALLBACK_QUOTE;
    }
}
