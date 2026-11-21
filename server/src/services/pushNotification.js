import * as webpush from "web-push";
import PushSubscription from "../models/PushSubscription.js";

const vapidConfigured =
  process.env.VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  process.env.VAPID_SUBJECT;

if (vapidConfigured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn("VAPID keys are not configured.");
}

export const getVapidPublicKey = () => {
  return process.env.VAPID_PUBLIC_KEY || null;
};

export const sendPushNotification = async (userId, payload) => {
  if (!vapidConfigured) {
    console.warn("Push notification skipped: VAPID not configured.");
    return;
  }

  try {
    const subscriptions = await PushSubscription.find({
      user: userId
    });

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys
            },
            JSON.stringify(payload)
          );
        } catch (error) {
          console.error("Push delivery error:", error.statusCode);

          // Remove subscriptions that are no longer valid.
          if (error.statusCode === 404 || error.statusCode === 410) {
            await PushSubscription.deleteOne({
              _id: subscription._id
            });
          }
        }
      })
    );
  } catch (error) {
    console.error("Push notification service error:", error.message);
  }
};