
import mongoose from "mongoose";

const cycleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    periodStartDate: {
      type: Date,
      required: true
    },

    periodEndDate: {
      type: Date,
      default: null
    },

    cycleLength: {
      type: Number,
      min: 15,
      max: 60,
      default: null
    },

    flow: {
      type: String,
      enum: ["light", "medium", "heavy", "unknown"],
      default: "unknown"
    },

    notes: {
      type: String,
      maxlength: 500,
      default: ""
    }
  },
  { timestamps: true }
);

// Avoid duplicate cycle start records for the same user
cycleSchema.index(
  { user: 1, periodStartDate: 1 },
  { unique: true }
);

const Cycle = mongoose.model("Cycle", cycleSchema);

export default Cycle;
