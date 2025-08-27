import { ref, get } from 'firebase/database';
import { rtdb } from '../config/firebase';

export async function fetchPatientFromFirebase(mobileNumber: string) {
  const patientRef = ref(rtdb, `users/patients/${mobileNumber}`);
  const snapshot = await get(patientRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
} 