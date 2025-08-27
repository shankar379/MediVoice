export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  allergies: string[];
  emergencyContacts: EmergencyContact[];
  profileImage?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  userType: 'patient' | 'doctor' | 'admin';
}

export interface Doctor {
  id: string;
  email: string;
  name: string;
  phone: string;
  specialization: string;
  experience: number;
  licenseNumber: string;
  licenseImage?: string;
  profileImage?: string;
  rating: number;
  totalReviews: number;
  consultationFee: number;
  availableSlots: TimeSlot[];
  isVerified: boolean;
  isAvailable: boolean;
  education: string[];
  languages: string[];
  about: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: 'in-person' | 'video' | 'audio';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  symptoms: string;
  notes?: string;
  prescription?: Prescription;
  meetingLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  medicines: Medicine[];
  instructions: string;
  followUpDate?: string;
  diagnosis: string;
  createdAt: Date;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  price?: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  specialties: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  isOpen: boolean;
}

export interface Lab {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  tests: LabTest[];
  location: {
    latitude: number;
    longitude: number;
  };
  isOpen: boolean;
}

export interface LabTest {
  id: string;
  name: string;
  description: string;
  price: number;
  preparation?: string;
  duration: string;
}

export interface LabBooking {
  id: string;
  patientId: string;
  labId: string;
  tests: LabTest[];
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed';
  report?: string;
  totalAmount: number;
  createdAt: Date;
}

export interface HealthRecord {
  id: string;
  patientId: string;
  type: 'prescription' | 'lab_report' | 'vaccination' | 'surgery' | 'other';
  title: string;
  description: string;
  date: string;
  fileUrl?: string;
  doctorId?: string;
  doctorName?: string;
  createdAt: Date;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  isOpen: boolean;
  deliveryAvailable: boolean;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface MedicineOrder {
  id: string;
  patientId: string;
  pharmacyId: string;
  prescriptionId?: string;
  medicines: MedicineOrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  deliveryAddress: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: Date;
}

export interface MedicineOrderItem {
  name: string;
  quantity: number;
  price: number;
  prescription?: boolean;
}

export interface SymptomChecker {
  id: string;
  symptoms: string[];
  suggestedDepartment: string;
  confidence: number;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface EmergencyAlert {
  id: string;
  patientId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: 'active' | 'resolved';
  emergencyType: 'medical' | 'accident' | 'other';
  description: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'prescription' | 'emergency' | 'general';
  isRead: boolean;
  createdAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: 'card' | 'upi' | 'netbanking';
  description: string;
  createdAt: Date;
}

// AI Medicine Information and Voice Reminder Types
export interface MedicineInfo {
  id: string;
  name: string;
  genericName: string;
  brandNames: string[];
  description: string;
  uses: string[];
  dosage: {
    adults: string;
    children: string;
    elderly: string;
  };
  sideEffects: string[];
  precautions: string[];
  interactions: string[];
  category: string;
  prescriptionRequired: boolean;
  imageUrl?: string;
}

export interface ReminderLog {
  id: string;
  reminderId: string;
  scheduledTime: string;
  takenTime?: string;
  status: 'scheduled' | 'taken' | 'missed' | 'skipped';
  notes?: string;
  createdAt: Date;
}

export interface MedicineReminder {
  id: string;
  assignmentId: string;
  userId: string;
  scheduledTime: string;
  takenTime?: string;
  status: 'scheduled' | 'taken' | 'missed' | 'snoozed';
  snoozeCount: number;
  voicePlayed: boolean;
  notificationSent: boolean;
  notes?: string;
}

export interface MedicineSearchResult {
  medicine: MedicineInfo;
  relevance: number;
  matchType: 'exact' | 'partial' | 'generic' | 'brand';
}

// MediVoice App Types
export interface MediVoiceUser {
  id: string;
  mobileNumber: string;
  password: string;
  name: string;
  email?: string;
  dateOfBirth?: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  allergies: string[];
  emergencyContacts: EmergencyContact[];
  preferredLanguage: 'en-IN' | 'te-IN' | 'hi-IN' | 'ta-IN' | 'kn-IN' | 'ml-IN';
  voiceSettings: VoiceSettings;
  userType: 'patient' | 'doctor' | 'seller';
  createdAt: Date;
  updatedAt: Date;
}

export interface MediVoiceDoctor {
  id: string;
  mobileNumber: string;
  password: string;
  name: string;
  email?: string;
  specialization: string;
  experience: number;
  licenseNumber: string;
  isVerified: boolean;
  patients: string[]; // Patient IDs
  voiceSettings?: VoiceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediVoiceSeller {
  id: string;
  mobileNumber: string;
  password: string;
  name: string;
  email?: string;
  storeName: string;
  storeAddress: string;
  licenseNumber?: string;
  gstNumber?: string;
  isVerified: boolean;
  assignedUsers: string[]; // User IDs
  voiceSettings?: VoiceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicineAssignment {
  id: string;
  userId: string;
  assignedBy: string; // Seller or Doctor ID
  assignedByType: 'seller' | 'doctor';
  medicineName: string;
  genericName?: string;
  dosage: string;
  color?: string;
  shape?: string;
  photoUrl?: string;
  instructions: string;
  timings: string[];
  duration?: string;
  notes?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VoiceSettings {
  language: 'en-IN' | 'te-IN' | 'hi-IN' | 'ta-IN' | 'kn-IN' | 'ml-IN';
  voiceType: 'male' | 'female';
  volume: number;
  rate: number;
  pitch: number;
  enabled: boolean;
  personalization: {
    useName: boolean;
    useGender: boolean;
    customGreeting?: string;
  };
}

export interface SuperAdmin {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  role: 'super_admin';
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminAction {
  id: string;
  adminId: string;
  action: 'verify_doctor' | 'verify_seller' | 'block_user' | 'unblock_user' | 'delete_user';
  targetId: string;
  targetType: 'doctor' | 'seller' | 'patient';
  details: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
} 