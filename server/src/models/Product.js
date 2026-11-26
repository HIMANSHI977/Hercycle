import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    category: {
      type: String,
      enum: ["sanitary_pad", "tampon", "menstrual_cup", "panty_liner", "other"],
      default: "other"
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      max: 100000
    },
    minimumQuantity: {
      type: Number,
      required: true,
      min: 0,
      max: 100000,
      default: 5
    },
    lastPurchasedAt: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      maxlength: 300,
      default: ""
    }
  },
  { timestamps: true }
);

productSchema.index({ user: 1, name: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
