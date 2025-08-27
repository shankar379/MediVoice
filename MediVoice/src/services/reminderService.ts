import * as Speech from 'expo-speech';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MedicineReminder {
  id: string;
  medicineName: string;
  dosage: string;
  time: string; // ISO string or HH:mm
  language: string;
  ttsOptions?: Speech.SpeechOptions;
}

const REMINDERS_KEY = 'MEDIVOICE_REMINDERS';

export const scheduleReminder = async (reminder: MedicineReminder) => {
  // Save reminder locally
  const reminders = await getReminders();
  reminders.push(reminder);
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));

  // Schedule notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Medicine Reminder`,
      body: `It's time to take ${reminder.medicineName} (${reminder.dosage})`,
      sound: true,
    },
    trigger: { hour: parseInt(reminder.time.split(':')[0]), minute: parseInt(reminder.time.split(':')[1]), repeats: true },
  });
};

export const getReminders = async (): Promise<MedicineReminder[]> => {
  const data = await AsyncStorage.getItem(REMINDERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const speakReminder = (reminder: MedicineReminder, name: string) => {
  const message = `Hey ${name}, it's time to take ${reminder.medicineName}, ${reminder.dosage}.`;
  Speech.speak(message, { language: reminder.language, ...reminder.ttsOptions });
}; 