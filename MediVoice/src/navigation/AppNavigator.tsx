import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useMediVoice } from '../contexts/MediVoiceContext';
import LoadingScreen from '../components/LoadingScreen';
import { useRole } from '../contexts/RoleContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DoctorRegisterScreen from '../screens/auth/DoctorRegisterScreen';
import MediVoiceLoginScreen from '../screens/auth/MediVoiceLoginScreen';
import PatientRegisterScreen from '../screens/auth/PatientRegisterScreen';
import SellerRegisterScreen from '../screens/auth/SellerRegisterScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import AppointmentsScreen from '../screens/main/AppointmentsScreen';
import HealthRecordsScreen from '../screens/main/HealthRecordsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// MediVoice Screens
import PatientDashboardScreen from '../screens/medivoice/PatientDashboardScreen';
import SellerDashboardScreen from '../screens/medivoice/SellerDashboardScreen';
import DoctorDashboardScreen from '../screens/medivoice/DoctorDashboardScreen';
import MediVoiceProfileScreen from '../screens/medivoice/ProfileScreen';
import AssignMedicineScreen from '../screens/medivoice/AssignMedicineScreen';

// Appointment Screens
import BookAppointmentScreen from '../screens/appointments/BookAppointmentScreen';

// Consultation Screens
import VideoConsultScreen from '../screens/consultation/VideoConsultScreen';

// Prescription Screens
import PrescriptionScreen from '../screens/prescriptions/PrescriptionScreen';

// AI Screens
import SymptomCheckerScreen from '../screens/ai/SymptomCheckerScreen';

// Emergency Screens
import EmergencyScreen from '../screens/emergency/EmergencyScreen';

// Pharmacy Screens
import PharmacyScreen from '../screens/pharmacy/PharmacyScreen';

// Lab Screens
import LabTestsScreen from '../screens/labs/LabTestsScreen';

// Import new screens
import MedicineRemindersScreen from '../screens/reminders/MedicineRemindersScreen';
import WatchAdsScreen from '../screens/ads/WatchAdsScreen';
import CoinWalletScreen from '../screens/ads/CoinWalletScreen';
import EmergencySetupScreen from '../screens/emergency/EmergencySetupScreen';
import TriggerEmergencyScreen from '../screens/emergency/TriggerEmergencyScreen';
import MedicineChatScreen from '../screens/ai/MedicineChatScreen';
import SuperAdminDashboardScreen from '../screens/medivoice/SuperAdminDashboardScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Patient Tabs
const PatientTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e1e8ed',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="PatientDashboard"
        component={PatientDashboardScreen}
        options={{
          title: 'Medicines',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>💊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="MediVoiceProfile"
        component={MediVoiceProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Seller Tabs
const SellerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#27ae60',
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e1e8ed',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="SellerDashboard"
        component={SellerDashboardScreen}
        options={{
          title: 'Store',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏪</Text>
          ),
        }}
      />
      <Tab.Screen
        name="MediVoiceProfile"
        component={MediVoiceProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Doctor Tabs
const DoctorTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#e74c3c',
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e1e8ed',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="DoctorDashboard"
        component={DoctorDashboardScreen}
        options={{
          title: 'Patients',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👨‍⚕️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="MediVoiceProfile"
        component={MediVoiceProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Original Medical App Tabs
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e1e8ed',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📅</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Health Records"
        component={HealthRecordsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📋</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { currentUser, loading } = useAuth();
  const { currentUser: mediVoiceUser, currentDoctor, currentSeller } = useMediVoice();
  const { role } = useRole();

  if (loading) {
    return <LoadingScreen />;
  }

  // Determine which user type is logged in
  const getUserType = () => {
    if (role === 'super_admin') return 'super_admin';
    if (mediVoiceUser) return 'patient';
    if (currentDoctor) return 'doctor';
    if (currentSeller) return 'seller';
    if (currentUser) return 'medical';
    return null;
  };

  const userType = getUserType();

  let DashboardComponent = null;
  if (role === 'patient') DashboardComponent = PatientDashboardScreen;
  else if (role === 'doctor') DashboardComponent = DoctorDashboardScreen;
  else if (role === 'seller') DashboardComponent = SellerDashboardScreen;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#3498db',
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!userType ? (
          // Auth Stack - Show MediVoice login first
          <>
            <Stack.Screen
              name="MediVoiceLogin"
              component={MediVoiceLoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PatientRegister"
              component={PatientRegisterScreen}
              options={{ 
                title: 'Patient Registration',
                headerShown: true 
              }}
            />
            <Stack.Screen
              name="DoctorRegister"
              component={DoctorRegisterScreen}
              options={{ 
                title: 'Doctor Registration',
                headerShown: true 
              }}
            />
            <Stack.Screen
              name="SellerRegister"
              component={SellerRegisterScreen}
              options={{ 
                title: 'Store Registration',
                headerShown: true 
              }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : userType === 'super_admin' ? (
          // Super Admin Stack
          <>
            <Stack.Screen
              name="SuperAdminDashboard"
              component={SuperAdminDashboardScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : userType === 'patient' ? (
          // Patient Stack
          <>
            <Stack.Screen
              name="PatientTabs"
              component={PatientTabs}
              options={{ headerShown: false }}
            />
          </>
        ) : userType === 'seller' ? (
          // Seller Stack
          <>
            <Stack.Screen
              name="SellerTabs"
              component={SellerTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AssignMedicine"
              component={AssignMedicineScreen}
              options={{ title: 'Assign Medicine' }}
            />
          </>
        ) : userType === 'doctor' ? (
          // Doctor Stack
          <>
            <Stack.Screen
              name="DoctorTabs"
              component={DoctorTabs}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // Original Medical App Stack
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="BookAppointment"
              component={BookAppointmentScreen}
              options={{ title: 'Book Appointment' }}
            />
            <Stack.Screen
              name="VideoConsult"
              component={VideoConsultScreen}
              options={{ title: 'Video Consultation' }}
            />
            <Stack.Screen
              name="Prescription"
              component={PrescriptionScreen}
              options={{ title: 'E-Prescription' }}
            />
            <Stack.Screen
              name="SymptomChecker"
              component={SymptomCheckerScreen}
              options={{ title: 'AI Symptom Checker' }}
            />
            <Stack.Screen
              name="Emergency"
              component={EmergencyScreen}
              options={{ title: 'Emergency Services' }}
            />
            <Stack.Screen
              name="Pharmacy"
              component={PharmacyScreen}
              options={{ title: 'Pharmacy' }}
            />
            <Stack.Screen
              name="LabTests"
              component={LabTestsScreen}
              options={{ title: 'Lab Tests' }}
            />
            <Stack.Screen name="MedicineReminders" component={MedicineRemindersScreen} />
            <Stack.Screen name="WatchAds" component={WatchAdsScreen} />
            <Stack.Screen name="CoinWallet" component={CoinWalletScreen} />
            <Stack.Screen name="EmergencySetup" component={EmergencySetupScreen} />
            <Stack.Screen name="TriggerEmergency" component={TriggerEmergencyScreen} />
            <Stack.Screen name="MedicineChat" component={MedicineChatScreen} />
            {DashboardComponent && (
              <Stack.Screen name="Dashboard" component={DashboardComponent} />
            )}
            <Stack.Screen name="AssignMedicine" component={AssignMedicineScreen} options={{ title: 'Assign Medicine' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default AppNavigator; 