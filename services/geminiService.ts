// This file is now services/geminiService.js
import { GoogleGenAI } from "@google/genai";
import { LOCAL_STORAGE_KEY_QUOTE, LOCAL_STORAGE_KEY_API_KEY } from '../constants.js';

let aiClient = null;

// This function ensures the client is only created ONCE and only when needed.
function getAiClient() {
    // If the client already exists, return it.
    if (aiClient) {
        return aiClient;
    }
    
    // Retrieve the key from local storage.
    const apiKey = localStorage.getItem(LOCAL_STORAGE_KEY_API_KEY);
    
    // CRITICAL: If the key doesn't exist, we must not proceed.
    if (!apiKey) {
        console.error("Gemini API key not found in local storage. Cannot initialize AI client.");
        return null; 
    }
    
    // Create the client and store it for future use.
    try {
        aiClient = new GoogleGenAI({ apiKey });
        return aiClient;
    } catch (error) {
        console.error("Failed to initialize GoogleGenAI client:", error);
        return null;
    }
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

    // Attempt to get the client. It might be null if the key is missing.
    const ai = getAiClient();

    // If the client could not be initialized (e.g., no API key),
    // immediately return the fallback quote. This prevents the crash.
    if (!ai) {
        return FALLBACK_QUOTE;
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
        console.error("Error generating quote with Gemini API:", error);
        return FALLBACK_QUOTE;
    }
}