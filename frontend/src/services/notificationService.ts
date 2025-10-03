import favicon from "../../public/favicon/android-chrome-512x512.png";

class NotificationService {
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();
  private permissionsGranted = false;
  private notificationIcon: string;

  constructor() {
    this.notificationIcon = favicon;
    console.log("🔵 [NotificationService] Initialized with icon:", favicon);
  }

  async requestPermission(): Promise<boolean> {
    console.log("🔵 [NotificationService] Requesting permission...");

    if (!("Notification" in window)) {
      console.log(
        "🔴 [NotificationService] This browser does not support notifications"
      );
      return false;
    }

    if (Notification.permission === "granted") {
      this.permissionsGranted = true;
      console.log("🟢 [NotificationService] Permissions already granted");
      return true;
    }

    if (Notification.permission !== "denied") {
      console.log("🔵 [NotificationService] Asking for permission...");
      const permission = await Notification.requestPermission();
      this.permissionsGranted = permission === "granted";
      console.log(
        `🔵 [NotificationService] Permission result: ${permission}, granted: ${this.permissionsGranted}`
      );
      return this.permissionsGranted;
    }

    console.log("🔴 [NotificationService] Permissions denied by user");
    return false;
  }

  scheduleNotification(
    taskText: string,
    notificationTime: Date,
    taskId: string
  ) {
    console.log("🔵 [NotificationService] Scheduling notification:", {
      taskId,
      taskText,
      notificationTime,
      currentTime: new Date(),
    });

    this.cancelNotification(taskId);

    const now = new Date().getTime();
    const notifyTime = notificationTime.getTime();
    const delay = notifyTime - now;

    console.log("🔵 [NotificationService] Notification timing:", {
      now,
      notifyTime,
      delay,
      delayInMinutes: delay / (1000 * 60),
    });

    if (delay <= 0) {
      console.log("🔴 [NotificationService] Notification time is in the past");
      return;
    }

    const timeoutId = setTimeout(() => {
      console.log(
        "🟢 [NotificationService] Executing notification for task:",
        taskId
      );
      this.showNotification(taskText, taskId);
      this.scheduledNotifications.delete(taskId);
    }, delay);

    this.scheduledNotifications.set(taskId, timeoutId);
    console.log("🟢 [NotificationService] Notification scheduled successfully");
  }

  private showNotification(taskText: string, taskId: string) {
    console.log("🔵 [NotificationService] Showing notification:", {
      taskId,
      taskText,
    });

    if (!this.permissionsGranted) {
      console.log(
        "🔴 [NotificationService] Notification permissions not granted"
      );
      return;
    }

    try {
      const notification = new Notification("Todo List Reminder", {
        body: `Task: ${taskText}`,
        icon: this.notificationIcon,
        tag: taskId,
        requireInteraction: true,
      });

      console.log("🟢 [NotificationService] Notification created successfully");

      notification.onclick = () => {
        console.log("🔵 [NotificationService] Notification clicked");
        window.focus();
        notification.close();
      };

      setTimeout(() => {
        console.log("🔵 [NotificationService] Auto-closing notification");
        notification.close();
      }, 10000);
    } catch (error) {
      console.error(
        "🔴 [NotificationService] Error showing notification:",
        error
      );

      try {
        console.log("🔵 [NotificationService] Trying fallback notification...");
        const fallbackNotification = new Notification("Todo List Reminder", {
          body: `Task: ${taskText}`,
          tag: taskId,
        });

        setTimeout(() => {
          console.log(
            "🔵 [NotificationService] Auto-closing fallback notification"
          );
          fallbackNotification.close();
        }, 10000);
      } catch (fallbackError) {
        console.error(
          "🔴 [NotificationService] Fallback notification also failed:",
          fallbackError
        );
      }
    }
  }

  cancelNotification(taskId: string) {
    console.log("🔵 [NotificationService] Canceling notification:", taskId);
    const timeoutId = this.scheduledNotifications.get(taskId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(taskId);
      console.log("🟢 [NotificationService] Notification canceled");
    } else {
      console.log("🔵 [NotificationService] No notification found to cancel");
    }
  }

  cancelAllNotifications() {
    console.log(
      "🔵 [NotificationService] Canceling all notifications, count:",
      this.scheduledNotifications.size
    );
    this.scheduledNotifications.forEach((timeoutId, taskId) => {
      console.log(
        "🔵 [NotificationService] Canceling notification for task:",
        taskId
      );
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
    console.log("🟢 [NotificationService] All notifications canceled");
  }

  setNotificationIcon(iconPath: string) {
    console.log(
      "🔵 [NotificationService] Setting notification icon:",
      iconPath
    );
    this.notificationIcon = iconPath;
  }
}

export const notificationService = new NotificationService();
