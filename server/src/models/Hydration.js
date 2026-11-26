import mongoose from "mongoose";

const hydrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    amountMl: {
      type: Number,
      required: true,
      min: 50,
      max: 3000
    },
    recordedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  { timestamps: true }
);

hydrationSchema.index({ user: 1, recordedAt: -1 });

const Hydration = mongoose.model("Hydration", hydrationSchema);

export default Hydration;
