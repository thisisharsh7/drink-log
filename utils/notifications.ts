import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NOTIFICATION_MESSAGES = [
  'Thirsty? 💧',
  'Time for a refill! 🥤',
  'Stay hydrated! 💙',
  'Don\'t forget to drink water! 💦',
  'Hydration check! 🌊',
];

export const notificationUtils = {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // For Android, configure notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('hydra-reminders', {
          name: 'Hydration Reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#00BFFF',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  async scheduleReminders(): Promise<void> {
    try {
      // Cancel any existing notifications first
      await this.cancelAllReminders();

      // Schedule reminders at different times throughout the day
      // Morning (9 AM), Midday (12 PM), Afternoon (3 PM), Evening (6 PM)
      const reminderTimes = [
        { hour: 9, minute: 0 },   // 9 AM
        { hour: 12, minute: 0 },  // 12 PM
        { hour: 15, minute: 0 },  // 3 PM
        { hour: 18, minute: 0 },  // 6 PM
      ];

      for (let i = 0; i < reminderTimes.length; i++) {
        const time = reminderTimes[i];
        const message = NOTIFICATION_MESSAGES[i % NOTIFICATION_MESSAGES.length];

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Hydra',
            body: message,
            data: { type: 'hydration-reminder' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour: time.hour,
            minute: time.minute,
            repeats: true,
          },
        });
      }

      console.log('Reminders scheduled successfully');
    } catch (error) {
      console.error('Error scheduling reminders:', error);
    }
  },

  async cancelAllReminders(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All reminders cancelled');
    } catch (error) {
      console.error('Error cancelling reminders:', error);
    }
  },

  async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  },
};
