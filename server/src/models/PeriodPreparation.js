import mongoose from "mongoose";

const preparationItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true,
      maxlength: 120
    },
    checked: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const periodPreparationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    checklist: {
      type: [preparationItemSchema],
      default: []
    },
    personalNotes: {
      type: String,
      maxlength: 500,
      default: ""
    },
    reminderLeadDays: {
      type: Number,
      min: 0,
      max: 30,
      default: 3
    }
  },
  { timestamps: true }
);

const PeriodPreparation = mongoose.model(
  "PeriodPreparation",
  periodPreparationSchema
);

export default PeriodPreparation;
