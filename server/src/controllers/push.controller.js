import PushSubscription from "../models/PushSubscription.js";

import {
  getVapidPublicKey
} from "../services/pushNotification.js";

// Get public VAPID key
export const getPublicKey = (req, res) => {
  const publicKey = getVapidPublicKey();

  if (!publicKey) {
    return res.status(500).json({
      success: false,
      message: "Push notifications are not configured."
    });
  }

  return res.status(200).json({
    success: true,
    publicKey
  });
};

// Save browser subscription
export const subscribeToPush = async (req, res) => {
  try {
    const subscription = req.body;

    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid push subscription."
      });
    }

    await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        $set: {
          user: req.user._id,
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth
          }
        }
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );

    return res.status(201).json({
      success: true,
      message: "Push subscription saved successfully."
    });
  } catch (error) {
    console.error("Push subscription error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save push subscription."
    });
  }
};

// Remove browser subscription
export const unsubscribeFromPush = async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: "Subscription endpoint is required."
      });
    }

    await PushSubscription.deleteOne({
      user: req.user._id,
      endpoint
    });

    return res.status(200).json({
      success: true,
      message: "Push subscription removed."
    });
  } catch (error) {
    console.error("Push unsubscribe error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to remove push subscription."
    });
  }
};