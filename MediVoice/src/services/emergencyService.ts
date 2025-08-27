import { Linking, Vibration } from 'react-native';
import * as Location from 'expo-location';
import { getDatabase, ref, push, set } from 'firebase/database';
import { rtdb } from '../config/firebase';
// You may need to install and link react-native-sms and react-native-call for full functionality

export const sendEmergencySMS = async (contacts: string[], message: string) => {
  // Use Linking for SMS URI as a fallback
  for (const number of contacts) {
    const url = `sms:${number}?body=${encodeURIComponent(message)}`;
    await Linking.openURL(url);
  }
};

export const makeEmergencyCalls = async (contacts: string[]) => {
  for (const number of contacts) {
    const url = `tel:${number}`;
    await Linking.openURL(url);
  }
};

export const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;
  const location = await Location.getCurrentPositionAsync({});
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
};

export const triggerEmergencyAlert = async ({
  userId,
  name,
  phone,
  type = 'patient',
  location = null,
  isDemo = true,
}: {
  userId: string;
  name: string;
  phone: string;
  type?: string;
  location?: { latitude: number; longitude: number } | null;
  isDemo?: boolean;
}) => {
  // 1. Vibrate
  Vibration.vibrate(300);

  // 2. Call demo number
  await Linking.openURL('tel:6304760191');

  // 3. Save to Firebase
  const db = rtdb || getDatabase();
  const alertsRef = ref(db, '/emergency_alerts');
  const alertData = {
    timestamp: new Date().toISOString(),
    userId,
    name,
    phone,
    location: location ? `${location.latitude},${location.longitude}` : 'Not Available',
    type,
    status: 'active',
    isDemo,
  };
  const newAlertRef = push(alertsRef);
  await set(newAlertRef, alertData);

  // 4. Return for UI to handle modal/toast
  return alertData;
}; 