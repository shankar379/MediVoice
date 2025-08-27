import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SuperAdmin, AdminAction, MediVoiceDoctor, MediVoiceSeller, MediVoiceUser } from '../types';
import { rtdb } from '../config/firebase';
import { ref, set, get, update } from 'firebase/database';

interface SuperAdminContextType {
  // Current admin
  currentAdmin: SuperAdmin | null;
  
  // Data
  allDoctors: MediVoiceDoctor[];
  allSellers: MediVoiceSeller[];
  allPatients: MediVoiceUser[];
  adminActions: AdminAction[];
  
  // Loading states
  loading: boolean;
  
  // Admin actions
  loginSuperAdmin: (username: string, password: string) => Promise<SuperAdmin | null>;
  logoutSuperAdmin: () => Promise<void>;
  
  // User management
  verifyDoctor: (doctorId: string) => Promise<void>;
  verifySeller: (sellerId: string) => Promise<void>;
  blockUser: (userId: string, userType: 'doctor' | 'seller' | 'patient') => Promise<void>;
  unblockUser: (userId: string, userType: 'doctor' | 'seller' | 'patient') => Promise<void>;
  deleteUser: (userId: string, userType: 'doctor' | 'seller' | 'patient') => Promise<void>;
  
  // Data fetching
  loadAllUsers: () => Promise<void>;
  loadAdminActions: () => Promise<void>;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export const useSuperAdmin = () => {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider');
  }
  return context;
};

interface SuperAdminProviderProps {
  children: ReactNode;
}

export const SuperAdminProvider: React.FC<SuperAdminProviderProps> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<SuperAdmin | null>(null);
  const [allDoctors, setAllDoctors] = useState<MediVoiceDoctor[]>([]);
  const [allSellers, setAllSellers] = useState<MediVoiceSeller[]>([]);
  const [allPatients, setAllPatients] = useState<MediVoiceUser[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminFromStorage();
  }, []);

  const loadAdminFromStorage = async () => {
    try {
      const adminData = await AsyncStorage.getItem('super_admin_current');
      if (adminData) {
        const admin = JSON.parse(adminData);
        // Convert ISO date strings back to Date objects
        const adminWithDates = {
          ...admin,
          createdAt: new Date(admin.createdAt),
          updatedAt: new Date(admin.updatedAt),
        };
        setCurrentAdmin(adminWithDates);
      }
    } catch (error) {
      console.error('Error loading admin from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const loginSuperAdmin = async (username: string, password: string): Promise<SuperAdmin | null> => {
    console.log('=== SUPER ADMIN LOGIN DEBUG ===');
    console.log('Attempting super admin login:', username);
    
    // Check for secret credentials
    if (username === '369369369' && password === 'Shanav@1609') {
      const admin: SuperAdmin = {
        id: 'super_admin_001',
        username: '369369369',
        password: 'Shanav@1609',
        name: 'Super Administrator',
        email: 'admin@medivoice.com',
        role: 'super_admin',
        permissions: ['verify_doctors', 'verify_sellers', 'manage_users', 'view_analytics'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setCurrentAdmin(admin);
      
      // Convert Date objects to ISO strings for storage
      const adminForStorage = {
        ...admin,
        createdAt: admin.createdAt.toISOString(),
        updatedAt: admin.updatedAt.toISOString(),
      };
      
      await AsyncStorage.setItem('super_admin_current', JSON.stringify(adminForStorage));
      console.log('Super admin login successful');
      console.log('=== END SUPER ADMIN LOGIN DEBUG ===');
      return admin;
    }
    
    console.log('Super admin login failed - invalid credentials');
    console.log('=== END SUPER ADMIN LOGIN DEBUG ===');
    return null;
  };

  const logoutSuperAdmin = async () => {
    setCurrentAdmin(null);
    await AsyncStorage.removeItem('super_admin_current');
  };

  const loadAllUsers = async () => {
    try {
      console.log('Loading all users for super admin...');
      
      // Load doctors
      const doctorsRef = ref(rtdb, 'users/doctors');
      const doctorsSnapshot = await get(doctorsRef);
      const doctors: MediVoiceDoctor[] = [];
      
      if (doctorsSnapshot.exists()) {
        doctorsSnapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          doctors.push({
            id: data.mobileNumber,
            mobileNumber: data.mobileNumber,
            password: data.password,
            name: data.name,
            email: data.email,
            specialization: data.specialization,
            experience: data.experience,
            licenseNumber: data.licenseNumber,
            isVerified: data.isVerified || false,
            patients: data.patients || [],
            voiceSettings: data.voiceSettings,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
      }
      setAllDoctors(doctors);
      console.log('Loaded doctors:', doctors.length);

      // Load sellers
      const sellersRef = ref(rtdb, 'users/sellers');
      const sellersSnapshot = await get(sellersRef);
      const sellers: MediVoiceSeller[] = [];
      
      if (sellersSnapshot.exists()) {
        sellersSnapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          sellers.push({
            id: data.mobileNumber,
            mobileNumber: data.mobileNumber,
            password: data.password,
            name: data.name,
            email: data.email,
            storeName: data.storeName,
            storeAddress: data.storeAddress,
            licenseNumber: data.licenseNumber,
            gstNumber: data.gstNumber,
            isVerified: data.isVerified || false,
            assignedUsers: data.assignedUsers || [],
            voiceSettings: data.voiceSettings,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
      }
      setAllSellers(sellers);
      console.log('Loaded sellers:', sellers.length);

      // Load patients
      const patientsRef = ref(rtdb, 'users/patients');
      const patientsSnapshot = await get(patientsRef);
      const patients: MediVoiceUser[] = [];
      
      if (patientsSnapshot.exists()) {
        patientsSnapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          patients.push({
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
            updatedAt: data.updatedAt,
          });
        });
      }
      setAllPatients(patients);
      console.log('Loaded patients:', patients.length);
      
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadAdminActions = async () => {
    try {
      const actionsRef = ref(rtdb, 'admin_actions');
      const actionsSnapshot = await get(actionsRef);
      const actions: AdminAction[] = [];
      
      if (actionsSnapshot.exists()) {
        actionsSnapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          actions.push({
            id: childSnapshot.key!,
            adminId: data.adminId,
            action: data.action,
            targetId: data.targetId,
            targetType: data.targetType,
            details: data.details,
            status: data.status,
            createdAt: data.createdAt,
          });
        });
      }
      setAdminActions(actions);
    } catch (error) {
      console.error('Error loading admin actions:', error);
    }
  };

  const verifyDoctor = async (doctorId: string) => {
    try {
      console.log('Verifying doctor:', doctorId);
      
      // Update in Realtime Database
      await update(ref(rtdb, `users/doctors/${doctorId}`), {
        isVerified: true,
        updatedAt: new Date(),
      });
      
      // Update local state
      setAllDoctors(prev => prev.map(doctor => 
        doctor.mobileNumber === doctorId 
          ? { ...doctor, isVerified: true, updatedAt: new Date() }
          : doctor
      ));
      
      // Log admin action
      const action: AdminAction = {
        id: Date.now().toString(),
        adminId: currentAdmin!.id,
        action: 'verify_doctor',
        targetId: doctorId,
        targetType: 'doctor',
        details: `Doctor ${doctorId} verified by super admin`,
        status: 'completed',
        createdAt: new Date(),
      };
      
      await set(ref(rtdb, `admin_actions/${action.id}`), action);
      setAdminActions(prev => [action, ...prev]);
      
      console.log('Doctor verified successfully');
    } catch (error) {
      console.error('Error verifying doctor:', error);
      throw error;
    }
  };

  const verifySeller = async (sellerId: string) => {
    try {
      console.log('Verifying seller:', sellerId);
      
      // Update in Realtime Database
      await update(ref(rtdb, `users/sellers/${sellerId}`), {
        isVerified: true,
        updatedAt: new Date(),
      });
      
      // Update local state
      setAllSellers(prev => prev.map(seller => 
        seller.mobileNumber === sellerId 
          ? { ...seller, isVerified: true, updatedAt: new Date() }
          : seller
      ));
      
      // Log admin action
      const action: AdminAction = {
        id: Date.now().toString(),
        adminId: currentAdmin!.id,
        action: 'verify_seller',
        targetId: sellerId,
        targetType: 'seller',
        details: `Seller ${sellerId} verified by super admin`,
        status: 'completed',
        createdAt: new Date(),
      };
      
      await set(ref(rtdb, `admin_actions/${action.id}`), action);
      setAdminActions(prev => [action, ...prev]);
      
      console.log('Seller verified successfully');
    } catch (error) {
      console.error('Error verifying seller:', error);
      throw error;
    }
  };

  const blockUser = async (userId: string, userType: 'doctor' | 'seller' | 'patient') => {
    try {
      console.log('Blocking user:', userId, 'Type:', userType);
      
      // Update in Realtime Database
      await update(ref(rtdb, `users/${userType}s/${userId}`), {
        isBlocked: true,
        updatedAt: new Date(),
      });
      
      // Log admin action
      const action: AdminAction = {
        id: Date.now().toString(),
        adminId: currentAdmin!.id,
        action: 'block_user',
        targetId: userId,
        targetType: userType,
        details: `${userType} ${userId} blocked by super admin`,
        status: 'completed',
        createdAt: new Date(),
      };
      
      await set(ref(rtdb, `admin_actions/${action.id}`), action);
      setAdminActions(prev => [action, ...prev]);
      
      console.log('User blocked successfully');
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  };

  const unblockUser = async (userId: string, userType: 'doctor' | 'seller' | 'patient') => {
    try {
      console.log('Unblocking user:', userId, 'Type:', userType);
      
      // Update in Realtime Database
      await update(ref(rtdb, `users/${userType}s/${userId}`), {
        isBlocked: false,
        updatedAt: new Date(),
      });
      
      // Log admin action
      const action: AdminAction = {
        id: Date.now().toString(),
        adminId: currentAdmin!.id,
        action: 'unblock_user',
        targetId: userId,
        targetType: userType,
        details: `${userType} ${userId} unblocked by super admin`,
        status: 'completed',
        createdAt: new Date(),
      };
      
      await set(ref(rtdb, `admin_actions/${action.id}`), action);
      setAdminActions(prev => [action, ...prev]);
      
      console.log('User unblocked successfully');
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string, userType: 'doctor' | 'seller' | 'patient') => {
    try {
      console.log('Deleting user:', userId, 'Type:', userType);
      
      // Remove from Realtime Database
      await set(ref(rtdb, `users/${userType}s/${userId}`), null);
      
      // Log admin action
      const action: AdminAction = {
        id: Date.now().toString(),
        adminId: currentAdmin!.id,
        action: 'delete_user',
        targetId: userId,
        targetType: userType,
        details: `${userType} ${userId} deleted by super admin`,
        status: 'completed',
        createdAt: new Date(),
      };
      
      await set(ref(rtdb, `admin_actions/${action.id}`), action);
      setAdminActions(prev => [action, ...prev]);
      
      console.log('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const value: SuperAdminContextType = {
    currentAdmin,
    allDoctors,
    allSellers,
    allPatients,
    adminActions,
    loading,
    loginSuperAdmin,
    logoutSuperAdmin,
    verifyDoctor,
    verifySeller,
    blockUser,
    unblockUser,
    deleteUser,
    loadAllUsers,
    loadAdminActions,
  };

  return (
    <SuperAdminContext.Provider value={value}>
      {children}
    </SuperAdminContext.Provider>
  );
}; 