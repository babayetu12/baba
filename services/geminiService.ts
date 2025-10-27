// This file is now services/geminiService.js
import { GoogleGenAI } from "@google/genai";
import { LOCAL_STORAGE_KEY_QUOTE } from '../constants.js';

// Fix: Per Gemini API guidelines, the API key must be provided exclusively via process.env.API_KEY.
// This also resolves the "Property 'env' does not exist on type 'ImportMeta'" error.
if (!process.env.API_KEY) {
  // This error will appear in the browser's console if the API_KEY environment variable is not set.
  throw new Error("API_KEY environment variable is not set. Please ensure it is configured.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const FALLBACK_QUOTE = "Believe you can and you're halfway there. - Theodore Roosevelt";

export async function generateInspirationalQuote() {
    try {
        const cachedItem = localStorage.getItem(LOCAL_STORAGE_KEY_QUOTE);
        if (cachedItem) {
            const { quote, timestamp } = JSON.parse(cachedItem);
            const isStale = (Date.now() - timestamp) > 24 * 60 * 60 * 1000;
            if (!isStale) {
                return quote;
            }
        }
    } catch (error) {
        console.error("Error reading cached quote:", error);
    }

    try {
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
        // Fix: Updated error message to reflect the use of process.env.API_KEY.
        console.error("Error generating quote with Gemini API. Check if your API_KEY is valid.", error);
        return FALLBACK_QUOTE;
    }
}
