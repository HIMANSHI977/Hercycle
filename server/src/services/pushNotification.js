
import * as webpush from "web-push";
import PushSubscription from "../models/PushSubscription.js";

const vapidConfigured = Boolean(
  process.env.VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  process.env.VAPID_SUBJECT
);

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
  const result = {
    attempted: 0,
    sent: 0,
    failed: 0,
    removed: 0
  };

  if (!vapidConfigured) {
    console.warn("Push skipped: VAPID configuration missing.");
    return result;
  }

  try {
    const subscriptions = await PushSubscription.find({
      user: userId
    });

    result.attempted = subscriptions.length;

    const deliveries = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys
            },
            JSON.stringify(payload)
          );

          result.sent++;
        } catch (error) {
          result.failed++;

          if ([404, 410].includes(error.statusCode)) {
            await PushSubscription.deleteOne({
              _id: subscription._id
            });

            result.removed++;
          }

          console.error(
            "Push delivery failed:",
            error.statusCode || error.message
          );
        }
      })
    );

    return result;
  } catch (error) {
    console.error("Push service error:", error.message);
    return result;
  }
};
