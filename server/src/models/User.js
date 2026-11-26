import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },

    preferences: {
      language: {
        type: String,
        enum: ["en", "hi"],
        default: "en"
      },

      cycleLength: {
        type: Number,
        min: 15,
        max: 60,
        default: 28
      },

      periodLength: {
        type: Number,
        min: 1,
        max: 15,
        default: 5
      },
      hydrationGoalMl: {
        type: Number,
        min: 500,
        max: 6000,
        default: 2000
      }
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
