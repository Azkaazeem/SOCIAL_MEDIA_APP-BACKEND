const router = require("express").Router();
const axios = require("axios");

// Fallback intelligent social media AI engine
function generateLocalAiResponse(message, userContext = {}) {
  const text = (message || "").toLowerCase().trim();

  // Caption generation intent
  if (text.includes("caption") || text.includes("post about") || text.includes("write a post") || text.includes("write post")) {
    const topic = message.replace(/write (a )?post (about )?|caption (for )?|post about /gi, "").trim();
    return (
      `✨ Here are a few engaging post captions about "${topic || "your day"}":\n\n` +
      `1️⃣ "Embracing the journey, one step at a time. 🌟 #${topic ? topic.replace(/\s+/g, '') : 'Moments'} #ZakoraVibes"\n` +
      `2️⃣ "Small moments, big memories. Living for days like this! ✨✨"\n` +
      `3️⃣ "Never stop learning, exploring, and sharing good vibes. What's inspiring you today? 👇💬"`
    );
  }

  // Hashtag generation intent
  if (text.includes("hashtag") || text.includes("tags")) {
    const topic = message.replace(/hashtag(s)? (for )?|generate tags (for )?/gi, "").trim();
    const tag = topic ? topic.replace(/\s+/g, '') : "SocialVibes";
    return (
      `🏷️ Recommended Hashtags for "${topic || "Social Post"}":\n\n` +
      `#${tag} #${tag}Daily #TrendingNow #ExplorePage #ZakoraSocial #ContentCreators #CommunityFirst #GoodVibesOnly #DailyInspiration`
    );
  }

  // Content idea intent
  if (text.includes("idea") || text.includes("suggest") || text.includes("what should i post")) {
    return (
      `💡 Here are 4 high-engagement post ideas you can try today:\n\n` +
      `1. **Behind-The-Scenes**: Share a snapshot of your workspace, current project, or daily routine.\n` +
      `2. **Question of the Day**: Ask an open question (e.g. "What's the best advice you received recently?").\n` +
      `3. **Milestone Celebration**: Share a small or big win and thank the people who supported you.\n` +
      `4. **Quick Tip / Recommendation**: Share a favorite book, tool, or life hack you recently discovered!`
    );
  }

  // About platform intent
  if (text.includes("zakora") || text.includes("platform") || text.includes("app") || text.includes("what is this") || text.includes("how to use")) {
    return (
      `🌐 **Welcome to ZakoraSocial!**\n\n` +
      `ZakoraSocial is a modern social networking platform where you can:\n` +
      `• Share photos, videos, and articles with your community.\n` +
      `• Connect with friends, follow creators, and see real-time updates.\n` +
      `• Like, comment, and celebrate birthdays.\n` +
      `• Use me (Zakora AI) to brainstorm posts, captions, and creative ideas!`
    );
  }

  // Bio generation intent
  if (text.includes("bio") || text.includes("profile description")) {
    return (
      `📝 Here are 3 creative bio ideas for your profile:\n\n` +
      `1. "Dreamer • Creator • Explorer 🌍 | Sharing moments & positivity ✨"\n` +
      `2. "Building things, loving life, and connecting with curious minds. Let's talk! 🚀"\n` +
      `3. "Capturing stories through photos and words 📸 | Coffee lover & learner ☕"`
    );
  }

  // Greeting
  if (text.includes("hi") || text.includes("hello") || text.includes("hey") || text.includes("salam") || text.includes("assalam")) {
    return `Hello there! 👋 I am **Zakora AI**, your personal social media assistant. How can I assist you today? You can ask me to write a post caption, brainstorm ideas, suggest hashtags, or learn how to make the most of ZakoraSocial!`;
  }

  // General helpful response
  return (
    `I'm here to help you get the best experience on ZakoraSocial! 🚀\n\n` +
    `You can ask me to:\n` +
    `• ✍️ Write a catchy post or article caption\n` +
    `• 💡 Give you creative content ideas\n` +
    `• 🏷️ Generate trending hashtags\n` +
    `• 📝 Write a custom bio for your profile\n` +
    `• ❓ Answer any questions about how ZakoraSocial works\n\n` +
    `What would you like to create?`
  );
}

// POST /api/ai/chat
router.post("/chat", async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (geminiApiKey && geminiApiKey.trim() !== "") {
    try {
      const systemInstruction = 
        "You are Zakora AI, a friendly, intelligent, and helpful AI assistant embedded in the ZakoraSocial platform. " +
        "Help users craft engaging social media posts, write captions, recommend hashtags, brainstorm ideas, write profile bios, and answer questions warmly and concisely.";

      const contents = [];
      if (Array.isArray(history)) {
        history.slice(-6).forEach((h) => {
          if (h.role && h.text) {
            contents.push({
              role: h.role === "assistant" ? "model" : "user",
              parts: [{ text: h.text }]
            });
          }
        });
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey.trim()}`,
        {
          contents: contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600
          }
        },
        { timeout: 15000 }
      );

      const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) {
        return res.status(200).json({ reply });
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to local AI engine:", err.message);
    }
  }

  // Fallback to local intelligent assistant engine
  const reply = generateLocalAiResponse(message);
  return res.status(200).json({ reply });
});

module.exports = router;
