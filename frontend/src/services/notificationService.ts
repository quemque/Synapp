import favicon from "../../public/favicon/android-chrome-512x512.png";

class NotificationService {
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();
  private permissionsGranted = false;
  private notificationIcon: string;

  constructor() {
    this.notificationIcon = favicon;
  }

  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      this.permissionsGranted = true;
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      this.permissionsGranted = permission === "granted";
      return this.permissionsGranted;
    }

    return false;
  }

  scheduleNotification(
    taskText: string,
    notificationTime: Date,
    taskId: string
  ) {
    this.cancelNotification(taskId);

    const now = new Date().getTime();
    const notifyTime = notificationTime.getTime();
    const delay = notifyTime - now;

    if (delay <= 0) {
      console.log("Notification time is in the past");
      return;
    }

    const timeoutId = setTimeout(() => {
      this.showNotification(taskText, taskId);
      this.scheduledNotifications.delete(taskId);
    }, delay);

    this.scheduledNotifications.set(taskId, timeoutId);
  }

  private showNotification(taskText: string, taskId: string) {
    if (!this.permissionsGranted) {
      console.log("Notification permissions not granted");
      return;
    }

    try {
      const notification = new Notification("Todo List Reminder", {
        body: `Task: ${taskText}`,
        icon: this.notificationIcon,
        tag: taskId,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => {
        notification.close();
      }, 10000);

      console.log(
        "Notification shown for task:",
        taskText,
        "with icon:",
        this.notificationIcon
      );
    } catch (error) {
      console.error("Error showing notification:", error);

      try {
        const fallbackNotification = new Notification("Todo List Reminder", {
          body: `Task: ${taskText}`,
          tag: taskId,
        });

        setTimeout(() => fallbackNotification.close(), 10000);
      } catch (fallbackError) {
        console.error("Fallback notification also failed:", fallbackError);
      }
    }
  }

  cancelNotification(taskId: string) {
    const timeoutId = this.scheduledNotifications.get(taskId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(taskId);
    }
  }

  cancelAllNotifications() {
    this.scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
  }

  setNotificationIcon(iconPath: string) {
    this.notificationIcon = iconPath;
  }
}

export const notificationService = new NotificationService();
