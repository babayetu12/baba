// This file is now services/geminiService.js
import { GoogleGenAI } from "@google/genai";
import { LOCAL_STORAGE_KEY_QUOTE, LOCAL_STORAGE_KEY_API_KEY } from '../constants.js';

let aiClient = null;

// This function ensures the client is only created ONCE and only when needed.
function getAiClient() {
    if (aiClient) {
        return aiClient;
    }
    
    const apiKey = localStorage.getItem(LOCAL_STORAGE_KEY_API_KEY);
    if (!apiKey) {
        // This should not happen if the App component logic is correct,
        // but it's a safeguard.
        throw new Error("API Key not found in local storage. Please enter it in the app.");
    }
    
    // Create the client and store it for future use.
    aiClient = new GoogleGenAI({ apiKey });
    return aiClient;
}

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
        // The client is requested here, safely, after the app has loaded
        // and the user has provided a key.
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
        console.error("Error generating quote:", error);
        // If the API call fails (e.g., invalid key), return the fallback
        // and don't overwrite the potentially good cached quote.
        return FALLBACK_QUOTE;
    }
}