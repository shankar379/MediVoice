import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  MediVoiceUser, 
  MediVoiceDoctor, 
  MediVoiceSeller, 
  MedicineAssignment, 
  MedicineReminder,
  VoiceSettings 
} from '../types';
import { rtdb } from '../config/firebase';
import { ref, set, get, child } from 'firebase/database';

interface MediVoiceContextType {
  // Current user
  currentUser: MediVoiceUser | null;
  currentDoctor: MediVoiceDoctor | null;
  currentSeller: MediVoiceSeller | null;
  
  // Data
  medicineAssignments: MedicineAssignment[];
  medicineReminders: MedicineReminder[];
  allUsers: MediVoiceUser[];
  allDoctors: MediVoiceDoctor[];
  allSellers: MediVoiceSeller[];
  
  // Loading states
  loading: boolean;
  
  // User actions
  registerUser: (userData: Partial<MediVoiceUser>) => Promise<void>;
  registerDoctor: (doctorData: Partial<MediVoiceDoctor>) => Promise<void>;
  registerSeller: (sellerData: Partial<MediVoiceSeller>) => Promise<void>;
  loginUser: (mobileNumber: string, password: string) => Promise<MediVoiceUser | null>;
  loginDoctor: (mobileNumber: string, password: string) => Promise<MediVoiceDoctor | null>;
  loginSeller: (mobileNumber: string, password: string) => Promise<MediVoiceSeller | null>;
  logout: () => Promise<void>;
  
  // Medicine actions
  assignMedicine: (assignment: Omit<MedicineAssignment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMedicineStatus: (reminderId: string, status: MedicineReminder['status']) => Promise<void>;
  refreshMedicineAssignments: () => Promise<void>;
  getUserByMobile: (mobileNumber: string) => MediVoiceUser | null;
  
  // Voice settings
  updateVoiceSettings: (userId: string, settings: VoiceSettings) => Promise<void>;
}

const MediVoiceContext = createContext<MediVoiceContextType | undefined>(undefined);

export const useMediVoice = () => {
  const context = useContext(MediVoiceContext);
  if (context === undefined) {
    throw new Error('useMediVoice must be used within a MediVoiceProvider');
  }
  return context;
};

interface MediVoiceProviderProps {
  children: ReactNode;
}

export const MediVoiceProvider: React.FC<MediVoiceProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MediVoiceUser | null>(null);
  const [currentDoctor, setCurrentDoctor] = useState<MediVoiceDoctor | null>(null);
  const [currentSeller, setCurrentSeller] = useState<MediVoiceSeller | null>(null);
  
  const [medicineAssignments, setMedicineAssignments] = useState<MedicineAssignment[]>([]);
  const [medicineReminders, setMedicineReminders] = useState<MedicineReminder[]>([]);
  const [allUsers, setAllUsers] = useState<MediVoiceUser[]>([]);
  const [allDoctors, setAllDoctors] = useState<MediVoiceDoctor[]>([]);
  const [allSellers, setAllSellers] = useState<MediVoiceSeller[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load all data from storage
      const [
        usersData,
        doctorsData,
        sellersData,
        assignmentsData,
        remindersData,
        currentUserData,
        currentDoctorData,
        currentSellerData
      ] = await Promise.all([
        AsyncStorage.getItem('medivoice_users'),
        AsyncStorage.getItem('medivoice_doctors'),
        AsyncStorage.getItem('medivoice_sellers'),
        AsyncStorage.getItem('medivoice_assignments'),
        AsyncStorage.getItem('medivoice_reminders'),
        AsyncStorage.getItem('medivoice_current_user'),
        AsyncStorage.getItem('medivoice_current_doctor'),
        AsyncStorage.getItem('medivoice_current_seller'),
      ]);

      if (usersData) setAllUsers(JSON.parse(usersData));
      if (doctorsData) setAllDoctors(JSON.parse(doctorsData));
      if (sellersData) setAllSellers(JSON.parse(sellersData));
      if (assignmentsData) setMedicineAssignments(JSON.parse(assignmentsData));
      if (remindersData) setMedicineReminders(JSON.parse(remindersData));
      if (currentUserData) setCurrentUser(JSON.parse(currentUserData));
      if (currentDoctorData) setCurrentDoctor(JSON.parse(currentDoctorData));
      if (currentSellerData) setCurrentSeller(JSON.parse(currentSellerData));
    } catch (error) {
      console.error('Error loading MediVoice data:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (userData: Partial<MediVoiceUser>) => {
    try {
      const newUser: MediVoiceUser = {
        id: userData.mobileNumber || Date.now().toString(),
        mobileNumber: userData.mobileNumber || '',
        password: userData.password || '',
        name: userData.name || '',
        email: userData.email || '',
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender || 'male',
        bloodGroup: userData.bloodGroup,
        allergies: userData.allergies || [],
        emergencyContacts: userData.emergencyContacts || [],
        preferredLanguage: userData.preferredLanguage || 'en-IN',
        voiceSettings: userData.voiceSettings || {
          language: 'en-IN',
          voiceType: 'female',
          volume: 1.0,
          rate: 1.0,
          pitch: 1.0,
          enabled: true,
          personalization: {
            useName: true,
            useGender: false,
          },
        },
        userType: 'patient',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Try to save to Realtime Database under users/patients/ structure
      try {
        await set(ref(rtdb, `users/patients/${newUser.mobileNumber}`), {
          name: newUser.name,
          mobileNumber: newUser.mobileNumber,
          password: newUser.password,
          email: newUser.email,
          dateOfBirth: newUser.dateOfBirth,
          gender: newUser.gender,
          bloodGroup: newUser.bloodGroup,
          allergies: newUser.allergies,
          emergencyContacts: newUser.emergencyContacts,
          voiceSettings: newUser.voiceSettings,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt
        });
        console.log('Successfully saved patient to Realtime Database');
      } catch (realtimeError) {
        console.warn('Realtime Database save failed, continuing with local storage only:', realtimeError);
        // Continue with local storage even if Realtime Database fails
      }
      
      // Update local state and AsyncStorage
      const updatedUsers = [...allUsers, newUser];
      setAllUsers(updatedUsers);
      await AsyncStorage.setItem('medivoice_users', JSON.stringify(updatedUsers));
      setCurrentUser(newUser);
      await AsyncStorage.setItem('medivoice_current_user', JSON.stringify(newUser));
      
      console.log('Patient registered successfully (local storage)');
    } catch (error) {
      console.error('Error registering patient:', error);
      throw error;
    }
  };

  const registerDoctor = async (doctorData: Partial<MediVoiceDoctor>) => {
    try {
      const newDoctor: MediVoiceDoctor = {
        id: doctorData.mobileNumber || Date.now().toString(),
        mobileNumber: doctorData.mobileNumber || '',
        password: doctorData.password || '',
        name: doctorData.name || '',
        email: doctorData.email || '',
        specialization: doctorData.specialization || '',
        experience: doctorData.experience || 0,
        licenseNumber: doctorData.licenseNumber || '',
        isVerified: false,
        patients: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Try to save to Realtime Database under users/doctors/ structure
      try {
        await set(ref(rtdb, `users/doctors/${newDoctor.mobileNumber}`), {
          name: newDoctor.name,
          mobileNumber: newDoctor.mobileNumber,
          password: newDoctor.password,
          email: newDoctor.email,
          specialization: newDoctor.specialization,
          experience: newDoctor.experience,
          licenseNumber: newDoctor.licenseNumber,
          isVerified: newDoctor.isVerified,
          patients: newDoctor.patients,
          voiceSettings: doctorData.voiceSettings || {
            language: 'en-IN',
            voiceType: 'female',
            volume: 1.0,
            rate: 1.0,
            pitch: 1.0,
            enabled: true,
            personalization: {
              useName: true,
              useGender: false,
            },
          },
          createdAt: newDoctor.createdAt,
          updatedAt: newDoctor.updatedAt
        });
        console.log('Successfully saved doctor to Realtime Database');
      } catch (realtimeError) {
        console.warn('Realtime Database save failed, continuing with local storage only:', realtimeError);
        // Continue with local storage even if Realtime Database fails
      }
      
      // Update local state and AsyncStorage
      const updatedDoctors = [...allDoctors, newDoctor];
      setAllDoctors(updatedDoctors);
      await AsyncStorage.setItem('medivoice_doctors', JSON.stringify(updatedDoctors));
      setCurrentDoctor(newDoctor);
      await AsyncStorage.setItem('medivoice_current_doctor', JSON.stringify(newDoctor));
      
      console.log('Doctor registered successfully (local storage)');
    } catch (error) {
      console.error('Error registering doctor:', error);
      throw error;
    }
  };

  const registerSeller = async (sellerData: Partial<MediVoiceSeller>) => {
    try {
      const newSeller: MediVoiceSeller = {
        id: sellerData.mobileNumber || Date.now().toString(),
        mobileNumber: sellerData.mobileNumber || '',
        password: sellerData.password || '',
        name: sellerData.name || '',
        email: sellerData.email || '',
        storeName: sellerData.storeName || '',
        storeAddress: sellerData.storeAddress || '',
        isVerified: false,
        assignedUsers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Try to save to Realtime Database under users/sellers/ structure
      try {
        await set(ref(rtdb, `users/sellers/${newSeller.mobileNumber}`), {
          name: newSeller.name,
          mobileNumber: newSeller.mobileNumber,
          password: newSeller.password,
          email: newSeller.email,
          storeName: newSeller.storeName,
          storeAddress: newSeller.storeAddress,
          licenseNumber: sellerData.licenseNumber || '',
          gstNumber: sellerData.gstNumber || '',
          isVerified: newSeller.isVerified,
          assignedUsers: newSeller.assignedUsers,
          voiceSettings: sellerData.voiceSettings || {
            language: 'en-IN',
            voiceType: 'female',
            volume: 1.0,
            rate: 1.0,
            pitch: 1.0,
            enabled: true,
            personalization: {
              useName: true,
              useGender: false,
            },
          },
          createdAt: newSeller.createdAt,
          updatedAt: newSeller.updatedAt
        });
        console.log('Successfully saved seller to Realtime Database');
      } catch (realtimeError) {
        console.warn('Realtime Database save failed, continuing with local storage only:', realtimeError);
        // Continue with local storage even if Realtime Database fails
      }
      
      // Update local state and AsyncStorage
      const updatedSellers = [...allSellers, newSeller];
      setAllSellers(updatedSellers);
      await AsyncStorage.setItem('medivoice_sellers', JSON.stringify(updatedSellers));
      setCurrentSeller(newSeller);
      await AsyncStorage.setItem('medivoice_current_seller', JSON.stringify(newSeller));
      
      console.log('Seller registered successfully (local storage)');
    } catch (error) {
      console.error('Error registering seller:', error);
      throw error;
    }
  };

  const loginUser = async (mobileNumber: string, password: string): Promise<MediVoiceUser | null> => {
    // Try to find user locally first
    let user = allUsers.find(u => u.mobileNumber === mobileNumber && u.password === password);
    if (!user) {
      // If not found locally, try to fetch from Realtime Database
      try {
        const userRef = ref(rtdb, `users/patients/${mobileNumber}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.password === password) {
            user = { 
              id: data.mobileNumber,
              mobileNumber: data.mobileNumber,
              password: data.password,
              name: data.name,
              email: data.email,
              dateOfBirth: data.dateOfBirth,
              gender: data.gender,
              bloodGroup: data.bloodGroup,
              allergies: data.allergies || [],
              emergencyContacts: data.emergencyContacts || [],
              preferredLanguage: data.preferredLanguage || 'en-IN',
              voiceSettings: data.voiceSettings,
              userType: 'patient',
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            } as MediVoiceUser;
            // Save to local DB
            const updatedUsers = [...allUsers, user];
            setAllUsers(updatedUsers);
            await AsyncStorage.setItem('medivoice_users', JSON.stringify(updatedUsers));
          }
        }
      } catch (error) {
        console.error('Error fetching user from Realtime Database:', error);
      }
    }
    if (user) {
      setCurrentUser(user);
      await AsyncStorage.setItem('medivoice_current_user', JSON.stringify(user));
      return user;
    }
    return null;
  };

  const loginDoctor = async (mobileNumber: string, password: string): Promise<MediVoiceDoctor | null> => {
    console.log('=== DOCTOR LOGIN DEBUG ===');
    console.log('Attempting to login doctor:', mobileNumber);
    
    // Try to find doctor locally first
    let doctor = allDoctors.find(d => d.mobileNumber === mobileNumber && d.password === password);
    console.log('Found doctor locally:', doctor ? 'Yes' : 'No');
    
    if (!doctor) {
      // If not found locally, try to fetch from Realtime Database
      console.log('Fetching doctor from Realtime Database...');
      try {
        const doctorRef = ref(rtdb, `users/doctors/${mobileNumber}`);
        const snapshot = await get(doctorRef);
        console.log('Database snapshot exists:', snapshot.exists());
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log('Doctor data from database:', data);
          if (data.password === password) {
            doctor = { 
              id: data.mobileNumber,
              mobileNumber: data.mobileNumber,
              password: data.password,
              name: data.name,
              email: data.email,
              specialization: data.specialization,
              experience: data.experience,
              licenseNumber: data.licenseNumber,
              isVerified: data.isVerified,
              patients: data.patients || [],
              voiceSettings: data.voiceSettings,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            } as MediVoiceDoctor;
            console.log('Created doctor object from database');
            // Save to local DB
            const updatedDoctors = [...allDoctors, doctor];
            setAllDoctors(updatedDoctors);
            await AsyncStorage.setItem('medivoice_doctors', JSON.stringify(updatedDoctors));
            console.log('Saved doctor to local storage');
          } else {
            console.log('Password mismatch for doctor');
          }
        } else {
          console.log('No doctor found in database');
        }
      } catch (error) {
        console.error('Error fetching doctor from Realtime Database:', error);
      }
    }
    
    if (doctor) {
      console.log('Setting current doctor:', doctor.name);
      setCurrentDoctor(doctor);
      await AsyncStorage.setItem('medivoice_current_doctor', JSON.stringify(doctor));
      console.log('Doctor login successful');
      console.log('=== END DOCTOR LOGIN DEBUG ===');
      return doctor;
    }
    
    console.log('Doctor login failed');
    console.log('=== END DOCTOR LOGIN DEBUG ===');
    return null;
  };

  const loginSeller = async (mobileNumber: string, password: string): Promise<MediVoiceSeller | null> => {
    // Try to find seller locally first
    let seller = allSellers.find(s => s.mobileNumber === mobileNumber && s.password === password);
    if (!seller) {
      // If not found locally, try to fetch from Realtime Database
      try {
        const sellerRef = ref(rtdb, `users/sellers/${mobileNumber}`);
        const snapshot = await get(sellerRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.password === password) {
            seller = { 
              id: data.mobileNumber,
              mobileNumber: data.mobileNumber,
              password: data.password,
              name: data.name,
              email: data.email,
              storeName: data.storeName,
              storeAddress: data.storeAddress,
              licenseNumber: data.licenseNumber,
              gstNumber: data.gstNumber,
              isVerified: data.isVerified,
              assignedUsers: data.assignedUsers || [],
              voiceSettings: data.voiceSettings,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            } as MediVoiceSeller;
            // Save to local DB
            const updatedSellers = [...allSellers, seller];
            setAllSellers(updatedSellers);
            await AsyncStorage.setItem('medivoice_sellers', JSON.stringify(updatedSellers));
          }
        }
      } catch (error) {
        console.error('Error fetching seller from Realtime Database:', error);
      }
    }
    if (seller) {
      setCurrentSeller(seller);
      await AsyncStorage.setItem('medivoice_current_seller', JSON.stringify(seller));
      return seller;
    }
    return null;
  };

  const logout = async () => {
    setCurrentUser(null);
    setCurrentDoctor(null);
    setCurrentSeller(null);
    await AsyncStorage.multiRemove([
      'medivoice_current_user',
      'medivoice_current_doctor',
      'medivoice_current_seller',
    ]);
  };

  const assignMedicine = async (assignment: Omit<MedicineAssignment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Generate a unique ID using timestamp + random number to avoid conflicts
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newAssignment: MedicineAssignment = {
        ...assignment,
        id: uniqueId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('Assigning medicine with ID:', uniqueId);
      console.log('Medicine details:', newAssignment);

      // Save globally (existing logic)
      try {
        await set(ref(rtdb, `assignments/${newAssignment.id}/`), { ...newAssignment });
        console.log('Successfully saved assignment to Realtime Database');
      } catch (realtimeError) {
        console.warn('Realtime Database save failed, continuing with local storage only:', realtimeError);
      }

      // Save under patient node as well
      try {
        // Remove undefined fields before saving
        const assignmentForFirebase = Object.fromEntries(
          Object.entries(newAssignment).filter(([_, v]) => v !== undefined)
        );
        await set(ref(rtdb, `users/patients/${newAssignment.userId}/mymedicines/${newAssignment.id}`), assignmentForFirebase);
        console.log('Successfully saved assignment under patient mymedicines');
      } catch (patientError) {
        console.warn('Failed to save assignment under patient mymedicines:', patientError);
      }

      // Update local state and AsyncStorage
      const updatedAssignments = [...medicineAssignments, newAssignment];
      setMedicineAssignments(updatedAssignments);
      await AsyncStorage.setItem('medivoice_assignments', JSON.stringify(updatedAssignments));
      
      console.log('Current medicine assignments count:', updatedAssignments.length);
      console.log('All assignments:', updatedAssignments.map(a => ({ id: a.id, name: a.medicineName })));

      // Create reminders for this assignment
      await createRemindersForAssignment(newAssignment);
      console.log('Medicine assigned successfully (local storage)');
    } catch (error) {
      console.error('Error assigning medicine:', error);
      throw error;
    }
  };

  const createRemindersForAssignment = async (assignment: MedicineAssignment) => {
    try {
      // Create reminders for each scheduled time
      const newReminders: MedicineReminder[] = [];
      
      if (assignment.timings && assignment.timings.length > 0) {
        // Create reminders for the next 7 days for each timing
        for (let day = 0; day < 7; day++) {
          for (const timing of assignment.timings) {
            const reminderDate = new Date();
            reminderDate.setDate(reminderDate.getDate() + day);
            
            // Parse the timing (e.g., "08:00" -> 8 hours, 0 minutes)
            const [hours, minutes] = timing.split(':').map(Number);
            reminderDate.setHours(hours, minutes, 0, 0);
            
            // Only create reminders for future dates
            if (reminderDate > new Date()) {
              const uniqueReminderId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              
              const newReminder: MedicineReminder = {
                id: uniqueReminderId,
                assignmentId: assignment.id,
                userId: assignment.userId,
                scheduledTime: reminderDate.toISOString(),
                takenTime: undefined,
                status: 'scheduled',
                snoozeCount: 0,
                voicePlayed: false,
                notificationSent: false,
                notes: undefined,
              };
              
              newReminders.push(newReminder);
            }
          }
        }
      }

      // If no timings or no future reminders, create at least one reminder for today
      if (newReminders.length === 0) {
        const uniqueReminderId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const todayReminder: MedicineReminder = {
          id: uniqueReminderId,
          assignmentId: assignment.id,
          userId: assignment.userId,
          scheduledTime: new Date().toISOString(),
          takenTime: undefined,
          status: 'scheduled',
          snoozeCount: 0,
          voicePlayed: false,
          notificationSent: false,
          notes: undefined,
        };
        newReminders.push(todayReminder);
      }

      const updatedReminders = [...medicineReminders, ...newReminders];
      setMedicineReminders(updatedReminders);
      await AsyncStorage.setItem('medivoice_reminders', JSON.stringify(updatedReminders));
      
      console.log(`Created ${newReminders.length} reminders for medicine: ${assignment.medicineName}`);
    } catch (error) {
      console.error('Error creating reminders for assignment:', error);
    }
  };

  const updateMedicineStatus = async (reminderId: string, status: MedicineReminder['status']) => {
    try {
      const updatedReminders = medicineReminders.map(reminder =>
        reminder.id === reminderId
          ? { ...reminder, status, takenTime: status === 'taken' ? new Date().toISOString() : reminder.takenTime }
          : reminder
      );
      setMedicineReminders(updatedReminders);
      await AsyncStorage.setItem('medivoice_reminders', JSON.stringify(updatedReminders));
    } catch (error) {
      console.error('Error updating medicine status:', error);
      throw error;
    }
  };

  const getUserByMobile = (mobileNumber: string): MediVoiceUser | null => {
    return allUsers.find(user => user.mobileNumber === mobileNumber) || null;
  };

  const updateVoiceSettings = async (userId: string, settings: VoiceSettings) => {
    try {
      // Update local DB
      const updatedUsers = allUsers.map(user =>
        user.id === userId ? { ...user, voiceSettings: settings, updatedAt: new Date() } : user
      );
      setAllUsers(updatedUsers);
      await AsyncStorage.setItem('medivoice_users', JSON.stringify(updatedUsers));
      // Update Realtime Database (try users, doctors, sellers collections)
      try { await set(ref(rtdb, `users/${userId}/voiceSettings`), settings); } catch {}
      try { await set(ref(rtdb, `doctors/${userId}/voiceSettings`), settings); } catch {}
      try { await set(ref(rtdb, `sellers/${userId}/voiceSettings`), settings); } catch {}
      // Update current user if it's the same user
      if (currentUser?.id === userId) {
        const updatedCurrentUser = { ...currentUser, voiceSettings: settings, updatedAt: new Date() };
        setCurrentUser(updatedCurrentUser);
        await AsyncStorage.setItem('medivoice_current_user', JSON.stringify(updatedCurrentUser));
      }
    } catch (error) {
      console.error('Error updating voice settings:', error);
      throw error;
    }
  };

  const refreshMedicineAssignments = async () => {
    try {
      const assignmentsData = await AsyncStorage.getItem('medivoice_assignments');
      if (assignmentsData) {
        const assignments = JSON.parse(assignmentsData);
        setMedicineAssignments(assignments);
        console.log('Refreshed medicine assignments:', assignments.length);
      }
    } catch (error) {
      console.error('Error refreshing medicine assignments:', error);
    }
  };

  const value: MediVoiceContextType = {
    currentUser,
    currentDoctor,
    currentSeller,
    medicineAssignments,
    medicineReminders,
    allUsers,
    allDoctors,
    allSellers,
    loading,
    registerUser,
    registerDoctor,
    registerSeller,
    loginUser,
    loginDoctor,
    loginSeller,
    logout,
    assignMedicine,
    updateMedicineStatus,
    refreshMedicineAssignments,
    getUserByMobile,
    updateVoiceSettings,
  };

  return (
    <MediVoiceContext.Provider value={value}>
      {children}
    </MediVoiceContext.Provider>
  );
}; 