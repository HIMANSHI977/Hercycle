import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    doctorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    specialty: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    clinicName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ""
    },
    appointmentAt: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },
    status: {
      type: String,
      enum: ["requested", "confirmed", "completed", "cancelled"],
      default: "requested"
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    }
  },
  { timestamps: true }
);

appointmentSchema.index({ user: 1, appointmentAt: -1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
