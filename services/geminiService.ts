import { GoogleGenAI } from "@google/genai";
import { LOCAL_STORAGE_KEY_QUOTE } from '../constants';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
    // Lazy initialization: create the client only when it's first needed.
    if (aiClient) {
        return aiClient;
    }
    
    // FIX: Per Gemini API guidelines, the API key must be obtained exclusively from process.env.API_KEY.
    // This also resolves the TypeScript error regarding 'import.meta.env'.
    // The guidelines state to assume the API key is pre-configured and accessible.
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
