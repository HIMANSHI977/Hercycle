
import mongoose from "mongoose";

const symptomSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    date: {
      type: Date,
      required: true,
      default: Date.now
    },

    symptoms: [
      {
        type: String,
        enum: [
          "cramps",
          "headache",
          "bloating",
          "fatigue",
          "back_pain",
          "breast_tenderness",
          "acne",
          "nausea",
          "other"
        ]
      }
    ],

    severity: {
      type: String,
      enum: ["mild", "moderate", "severe"],
      default: "mild"
    },

    mood: {
      type: String,
      enum: [
        "happy",
        "sad",
        "anxious",
        "irritated",
        "calm",
        "tired",
        "other"
      ],
      default: "other"
    },

    notes: {
      type: String,
      maxlength: 500,
      default: ""
    }
  },
  { timestamps: true }
);

symptomSchema.index({ user: 1, date: -1 });

const Symptom = mongoose.model("Symptom", symptomSchema);

export default Symptom;
