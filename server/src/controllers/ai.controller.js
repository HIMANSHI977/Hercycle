import ai from "../config/gemini.js";
import Cycle from "../models/Cycle.js";
import Symptom from "../models/Symptom.js";

const SYSTEM_INSTRUCTION = `
You are HerCycle AI, a friendly menstrual wellness assistant.

LANGUAGE RULES:
1. If the user writes in Hindi, respond in Hindi.
2. If the user writes in Hinglish (Hindi + English), respond naturally in Hinglish using Roman Hindi.
3. If the user writes in English, respond in English.
4. If an explicit language preference is supplied, follow that preference while preserving the user's greeting or request style.
5. Keep language simple, friendly and easy to understand.
6. Explain difficult medical terms in simple words.

YOUR RESPONSIBILITIES:
1. Explain menstrual health in simple language.
2. Suggest balanced Indian meals like dal, chana,
   palak, sattu, fruits and nutritious foods.
3. Share gentle yoga and relaxation suggestions.
4. Explain menstrual cycle phases and common symptoms.
5. Help users understand period-related wellness.
6. Be respectful, supportive and non-judgmental.

SAFETY RULES:
- You are not a doctor.
- Never diagnose medical conditions.
- Never prescribe medicines or doses.
- Never claim cycle predictions are guaranteed.
- Recommend professional medical advice for persistent,
  unusual or concerning symptoms.
- For severe pain, fainting or very heavy bleeding,
  recommend prompt medical care.
- Never invent medical facts.
- Keep answers clear and supportive.
- Do not replace professional healthcare.

Always make the user feel comfortable asking questions.
`;
const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const generateWithRetry = async (request, maxRetries = 2) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(request);
    } catch (error) {
      const status = error.status;

      const temporaryError =
        status === 503 ||
        status === 429 ||
        status === 500 ||
        status === 502;

      if (!temporaryError || attempt === maxRetries) {
        throw error;
      }

      const delay = 1500 * Math.pow(2, attempt);

      console.log(
        `Gemini temporary error (${status}). Retrying in ${delay}ms. Attempt ${attempt + 1}/${maxRetries}`
      );

      await wait(delay);
    }
  }
};

export const chatWithAI = async (req, res) => {
  try {
    const { message, history = [], language } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: "AI assistant is not configured."
      });
    }

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message under 2000 characters."
      });
    }

    if (!Array.isArray(history) || history.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation history."
      });
    }

    const validHistory = history.every(
      (item) =>
        item &&
        ["user", "model"].includes(item.role) &&
        typeof item.text === "string" &&
        item.text.length <= 2000
    );

    if (!validHistory) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation history format."
      });
    }

    if (language !== undefined && !["en", "hi"].includes(language)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language preference"
      });
    }

    const contents = [
      ...history.map((item) => ({
        role: item.role,
        parts: [{ text: item.text }]
      })),
      {
        role: "user",
        parts: [{ text: message.trim() }]
      }
    ];

    const model =
      process.env.GEMINI_MODEL || "gemini-3.8-flash";

    const languageInstruction = language === "hi"
      ? "The selected response language is Hindi. Respond in natural, easy-to-read Hindi unless the user explicitly asks otherwise."
      : language === "en"
        ? "The selected response language is English. Respond in clear, easy-to-understand English unless the user explicitly asks otherwise."
        : "";

    const latestCycle = await Cycle.findOne({ user: req.user._id })
      .sort({ periodStartDate: -1 })
      .select("periodStartDate periodEndDate cycleLength flow")
      .lean();

    const recentSymptoms = await Symptom.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(5)
      .select("date symptoms severity mood")
      .lean();

    const symptomSummary = recentSymptoms.length > 0
      ? recentSymptoms.map((record) =>
          `${record.symptoms.join(", ")} (${record.severity}, mood: ${record.mood})`
        ).join("; ")
      : "No recent symptoms recorded";

    const personalizationContext = latestCycle || recentSymptoms.length > 0
      ? `PRIVATE USER WELLNESS CONTEXT (use only when relevant):\n${latestCycle ? `Latest recorded period start: ${latestCycle.periodStartDate.toISOString().slice(0, 10)}. Flow: ${latestCycle.flow || "unknown"}.` : "No cycle record available."}\nRecent symptoms: ${symptomSummary}.\nDo not present this context as a diagnosis or guaranteed estimate.`
      : "No private wellness context is available.";

    const systemInstruction = languageInstruction
      ? `${SYSTEM_INSTRUCTION}\n\nCURRENT LANGUAGE PREFERENCE:\n${languageInstruction}\n\n${personalizationContext}`
      : `${SYSTEM_INSTRUCTION}\n\n${personalizationContext}`;

    const response = await generateWithRetry({
      model,
      contents,
      config: {
        systemInstruction
      }
    });

    const reply = response.text;

    if (!reply) {
      return res.status(502).json({
        success: false,
        message: "The AI could not generate a response. Please try again."
      });
    }

    return res.status(200).json({
      success: true,
      reply
    });

  } catch (error) {
    console.error("Gemini API error:", {
      message: error.message,
      status: error.status,
      model: process.env.GEMINI_MODEL
    });

    if (error.status === 503 || error.status === 429) {
      return res.status(503).json({
        success: false,
        message: "Our AI assistant is experiencing high demand. Please try again in a little while."
      });
    }

    return res.status(500).json({
      success: false,
      message: "AI assistant is temporarily unavailable."
    });
  }
};
