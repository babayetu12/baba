// This file is now services/geminiService.js
import { GoogleGenAI } from "@google/genai";
import { LOCAL_STORAGE_KEY_QUOTE } from '../constants.js';

let aiClient = null;

function getAiClient() {
    if (aiClient) {
        return aiClient;
    }
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API key is not available. Please ensure the API_KEY environment variable is set.");
    }

    aiClient = new GoogleGenAI({ apiKey });
    return aiClient;
}

const FALLBACK_QUOTE = "Believe you can and you're halfway there. - Theodore Roosevelt";

export async function generateInspirationalQuote() {
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
        console.error("Error generating quote with Gemini API. Ensure your API_KEY is set and valid.", error);
        return FALLBACK_QUOTE;
    }
}