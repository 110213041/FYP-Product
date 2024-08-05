import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";



function initGemini(key: string) {
    return new GoogleGenerativeAI(key);
}

function createNewModule(ai: GoogleGenerativeAI): GenerativeModel {
    return ai.getGenerativeModel({ model: "gemini-1.5-flash" });
}

export { initGemini, createNewModule }
