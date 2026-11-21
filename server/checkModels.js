
import "dotenv/config";
import ai from "./src/config/gemini.js";

const checkModels = async () => {
  try {
    const models = await ai.models.list();

    for await (const model of models) {
      if (model.supportedActions?.includes("generateContent")) {
        console.log("Model:", model.name);
        console.log("Display name:", model.displayName);
        console.log("----------------------------");
      }
    }
  } catch (error) {
    console.error("Model listing failed:", error.message);
  }
};

checkModels();
