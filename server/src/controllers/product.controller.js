import Product from "../models/Product.js";
import Reminder from "../models/Reminder.js";

const allowedCategories = [
  "sanitary_pad",
  "tampon",
  "menstrual_cup",
  "panty_liner",
  "other"
];

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id })
      .sort({ quantity: 1, name: 1 });

    const lowStockCount = products.filter(
      (product) => product.quantity <= product.minimumQuantity
    ).length;

    return res.status(200).json({
      success: true,
      count: products.length,
      lowStockCount,
      products
    });
  } catch (error) {
    console.error("Get products error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load product stock"
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      quantity,
      minimumQuantity,
      lastPurchasedAt,
      notes
    } = req.body;

    if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Product name must contain 1–100 characters"
      });
    }

    if (category && !allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product category"
      });
    }

    const stockQuantity = Number(quantity);
    const minimumStock = Number(minimumQuantity ?? 5);

    if (!Number.isInteger(stockQuantity) || stockQuantity < 0 || stockQuantity > 100000) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be between 0 and 100000"
      });
    }

    if (!Number.isInteger(minimumStock) || minimumStock < 0 || minimumStock > 100000) {
      return res.status(400).json({
        success: false,
        message: "Minimum quantity must be between 0 and 100000"
      });
    }

    let purchaseDate = null;

    if (lastPurchasedAt) {
      purchaseDate = new Date(lastPurchasedAt);

      if (Number.isNaN(purchaseDate.getTime()) || purchaseDate > new Date()) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid purchase date"
        });
      }
    }

    if (typeof notes !== "undefined" &&
      (typeof notes !== "string" || notes.length > 300)) {
      return res.status(400).json({
        success: false,
        message: "Notes cannot exceed 300 characters"
      });
    }

    const product = await Product.create({
      user: req.user._id,
      name: name.trim(),
      category: category || "other",
      quantity: stockQuantity,
      minimumQuantity: minimumStock,
      lastPurchasedAt: purchaseDate,
      notes: notes ? notes.trim() : ""
    });

    await syncLowStockReminder(req.user._id, product);

    return res.status(201).json({
      success: true,
      message: "Product stock added",
      product
    });
  } catch (error) {
    console.error("Create product error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to add product stock"
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const { name, category, quantity, minimumQuantity, lastPurchasedAt, notes } = req.body;
    const previousName = product.name;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: "Product name must contain 1–100 characters"
        });
      }
      product.name = name.trim();
    }

    if (category !== undefined) {
      if (!allowedCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product category"
        });
      }
      product.category = category;
    }

    if (quantity !== undefined) {
      const stockQuantity = Number(quantity);

      if (!Number.isInteger(stockQuantity) || stockQuantity < 0 || stockQuantity > 100000) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be between 0 and 100000"
        });
      }

      product.quantity = stockQuantity;
    }

    if (minimumQuantity !== undefined) {
      const minimumStock = Number(minimumQuantity);

      if (!Number.isInteger(minimumStock) || minimumStock < 0 || minimumStock > 100000) {
        return res.status(400).json({
          success: false,
          message: "Minimum quantity must be between 0 and 100000"
        });
      }

      product.minimumQuantity = minimumStock;
    }

    if (lastPurchasedAt !== undefined) {
      if (!lastPurchasedAt) {
        product.lastPurchasedAt = null;
      } else {
        const purchaseDate = new Date(lastPurchasedAt);

        if (Number.isNaN(purchaseDate.getTime()) || purchaseDate > new Date()) {
          return res.status(400).json({
            success: false,
            message: "Please enter a valid purchase date"
          });
        }

        product.lastPurchasedAt = purchaseDate;
      }
    }

    if (notes !== undefined) {
      if (typeof notes !== "string" || notes.length > 300) {
        return res.status(400).json({
          success: false,
          message: "Notes cannot exceed 300 characters"
        });
      }

      product.notes = notes.trim();
    }

    await product.save();

    if (previousName !== product.name) {
      await Reminder.updateMany(
        {
          user: req.user._id,
          title: `Purchase ${previousName}`,
          type: "product_stock"
        },
        { $set: { title: `Purchase ${product.name}` } }
      );
    }

    await syncLowStockReminder(req.user._id, product);

    return res.status(200).json({
      success: true,
      message: "Product stock updated",
      product
    });
  } catch (error) {
    console.error("Update product error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update product stock"
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    await Reminder.deleteMany({
      user: req.user._id,
      title: `Purchase ${product.name}`,
      type: "product_stock"
    });

    return res.status(200).json({
      success: true,
      message: "Product stock removed"
    });
  } catch (error) {
    console.error("Delete product error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to remove product stock"
    });
  }
};

const syncLowStockReminder = async (userId, product, previousName) => {
  const title = `Purchase ${product.name}`;

  const existingReminder = await Reminder.findOne({
    user: userId,
    title,
    type: "product_stock",
    isCompleted: false
  });

  if (product.quantity <= product.minimumQuantity) {
    if (!existingReminder) {
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 1);
      scheduledAt.setHours(9, 0, 0, 0);

      await Reminder.create({
        user: userId,
        title,
        type: "product_stock",
        scheduledAt
      });
    }
    return;
  }

  if (existingReminder) {
    existingReminder.isCompleted = true;
    existingReminder.isActive = false;
    await existingReminder.save();
  }

  if (previousName) {
    const oldTitle = `Purchase ${previousName}`;

    await Reminder.deleteMany({
      user: userId,
      title: oldTitle,
      type: "product_stock"
    });
  }
};
