
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle Chrome desktop notification clicks and actions
self.addEventListener("notificationclick", (event) => {
  const reminderId =
    event.notification.data?.reminderId;

  const action = event.action;

  event.notification.close();

  let minutes = null;

  if (action === "snooze-5") {
    minutes = 5;
  } else if (action === "snooze-10") {
    minutes = 10;
  } else if (action === "snooze-15") {
    minutes = 15;
  }

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true
      });

      let client =
        windows.find(
          (item) => item.visibilityState === "visible"
        ) || windows[0];

      if (client) {
        await client.focus();

        client.postMessage({
          type: minutes
            ? "SNOOZE_REMINDER"
            : "OPEN_REMINDER",
          reminderId,
          minutes
        });

        return;
      }

      // Open HerCycle if no browser window is available.
      // A newly opened page must be logged in before an
      // authenticated snooze request can be processed.
      await self.clients.openWindow("/");
    })()
  );
});
// Receive background push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;

  try {
    payload = event.data.json();
  } catch (error) {
    console.error("Invalid push notification payload:", error);
    return;
  }

  const options = {
    body: payload.body || "You have a reminder.",
    icon: payload.icon || "/favicon.ico",
    badge: payload.badge || "/favicon.ico",
    tag: payload.tag || "hercycle-reminder",
    renotify: true,
    data: payload.data || {},
    actions: payload.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(
      payload.title || "HerCycle Reminder",
      options
    )
  );
});