import ChatHistory from "../models/ChatHistory.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// System prompt for the AI tutor
const SYSTEM_PROMPT = `You are LearnBot, an AI tutor for the LearnIT platform. You help students learn programming, technology, computer science, and engineering topics ONLY.

STRICT DOMAIN RESTRICTION:
You MUST ONLY answer questions related to:
- Programming languages (JavaScript, Python, Java, C++, React, Node.js, etc.)
- Web development (HTML, CSS, frameworks, libraries)
- Computer science (algorithms, data structures, databases)
- Software engineering and technology
- Mathematics and science related to engineering
- Study techniques and learning strategies for technical subjects
- Educational resources and career guidance in tech/engineering

For ANY question outside engineering/tech education (e.g., law, medicine, recipes, sports, entertainment, politics, general life advice, etc.), you MUST respond:
"I apologize, but I'm specifically designed to help with engineering and educational topics like programming, technology, and computer science. For questions outside my domain, I recommend:
• Searching educational articles on the topic
• Consulting relevant external resources
• Asking subject matter experts

Is there anything related to learning, programming, or technology I can help you with? 📚"

Your personality:
- Friendly and encouraging
- Patient with beginners
- Use simple, clear language
- Provide specific examples and code snippets when relevant
- Use emojis occasionally (but not excessively)
- STRICTLY decline non-engineering/tech topics politely

When answering:
- Be specific to the exact question asked (e.g., if asked about "React Router", explain React Router specifically, not just React)
- Keep responses concise but comprehensive
- If you don't know something within your domain, admit it and suggest learning resources`;

// Send message to chatbot
export const sendMessage = async (req, res) => {
    try {
        const userId = req.user._id;
        const { message, sessionId, context } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        // Find or create chat session
        let chatSession = sessionId
            ? await ChatHistory.findOne({ sessionId, userId })
            : null;

        if (!chatSession) {
            chatSession = await ChatHistory.create({
                userId,
                sessionId: sessionId || crypto.randomUUID(),
                messages: [],
                context: context || {}
            });
        }

        // Add user message
        chatSession.messages.push({ role: 'user', content: message });

        // Generate AI response
        let aiResponse = "";

        try {
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash"
            });

            // Build conversation history with system prompt
            const history = [];
            
            // Add system prompt as first model message if it's a new conversation
            if (chatSession.messages.length === 1) {
                history.push({
                    role: 'model',
                    parts: [{ text: "Understood. I am LearnBot, an AI tutor focused solely on engineering, programming, technology, and computer science education. I will decline any questions outside these domains politely." }]
                });
            }
            
            // Add recent conversation history (excluding the current user message)
            chatSession.messages.slice(-10, -1).forEach(msg => {
                history.push({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                });
            });

            const chat = model.startChat({
                history: history,
                generationConfig: { 
                    maxOutputTokens: 1000,
                    temperature: 0.7
                }
            });

            // Send message with system context
            const promptWithContext = `${SYSTEM_PROMPT}\n\nUser question: ${message}`;
            const result = await chat.sendMessage(promptWithContext);
            aiResponse = result.response.text();
        } catch (aiError) {
            console.error("AI Error:", aiError);
            // Fallback responses
            aiResponse = getFallbackResponse(message);
        }

        // Add AI response to history
        chatSession.messages.push({ role: 'assistant', content: aiResponse });

        // Update session title from first message
        if (chatSession.messages.length <= 2) {
            chatSession.sessionTitle = message.slice(0, 50) + (message.length > 50 ? '...' : '');
        }

        await chatSession.save();

        res.json({
            success: true,
            data: {
                sessionId: chatSession.sessionId,
                message: aiResponse,
                messageCount: chatSession.messages.length
            }
        });
    } catch (error) {
        console.error("Error in chat:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get chat history
export const getChatHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { sessionId } = req.params;

        const session = await ChatHistory.findOne({ sessionId, userId });
        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        res.json({ success: true, data: session });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all chat sessions
export const getSessions = async (req, res) => {
    try {
        const userId = req.user._id;

        const sessions = await ChatHistory.find({ userId, isActive: true })
            .select('sessionId sessionTitle messageCount updatedAt')
            .sort({ updatedAt: -1 })
            .limit(20);

        res.json({ success: true, data: sessions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete chat session
export const deleteSession = async (req, res) => {
    try {
        const userId = req.user._id;
        const { sessionId } = req.params;

        await ChatHistory.findOneAndDelete({ sessionId, userId });
        res.json({ success: true, message: "Session deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Fallback responses when AI is unavailable
function getFallbackResponse(message) {
    const lower = message.toLowerCase();

    // Check for legal article patterns (article 300A, article 21, etc.)
    if (/article\s+\d+[a-z]?/i.test(message)) {
        return "I apologize, but I'm specifically designed to help with engineering and educational topics like programming, technology, and computer science. Legal topics like constitutional articles are outside my domain.\n\nFor questions outside my expertise, I recommend:\n• Searching educational articles on the topic\n• Consulting relevant external resources\n• Asking subject matter experts\n\nIs there anything related to programming or technology I can help you with? 📚";
    }

    // Check for non-educational/non-engineering topics
    const nonEngineeringKeywords = [
        'recipe', 'cook', 'food', 'restaurant', 'movie', 'film', 'sport', 
        'football', 'cricket', 'game', 'play', 'weather', 'news', 
        'politics', 'celebrity', 'gossip', 'shopping', 'buy',
        'law', 'legal', 'attorney', 'court', 'medicine', 'medical', 'doctor',
        'fashion', 'makeup', 'beauty', 'travel', 'tourism'
    ];

    if (nonEngineeringKeywords.some(keyword => lower.includes(keyword))) {
        return "I apologize, but I'm specifically designed to help with engineering and educational topics like programming, technology, computer science, and academics. For questions outside my domain, I recommend:\n• Searching educational articles on the topic\n• Consulting relevant external resources\n• Asking subject matter experts\n\nIs there anything related to learning, programming, or technology I can help you with? 📚";
    }

    if (lower.includes('hello') || lower.includes('hi')) {
        return "Hello! 👋 I'm LearnBot, your educational AI tutor. How can I help you learn programming, technology, or computer science today?";
    }
    
    if (lower.includes('help')) {
        return "I'm here to help with your learning! You can ask me about:\n• Programming concepts (JavaScript, Python, Java, etc.)\n• Web development (HTML, CSS, React, Node.js)\n• Computer science topics\n• Study techniques and learning strategies\n• Code debugging and examples\n• Technology and software engineering\n\nWhat would you like to learn? 📚";
    }

    return "I'm here to help you learn about programming, technology, and engineering topics! 🤔 Could you provide more details about what you'd like to know?";
}
