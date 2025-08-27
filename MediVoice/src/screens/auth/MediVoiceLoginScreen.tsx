import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useMediVoice } from '../../contexts/MediVoiceContext';
import { useRole } from '../../contexts/RoleContext';
import { useSuperAdmin } from '../../contexts/SuperAdminContext';

const MediVoiceLoginScreen: React.FC = ({ navigation }: any) => {
  const { loginUser, loginDoctor, loginSeller } = useMediVoice();
  const { setRole } = useRole();
  const { loginSuperAdmin } = useSuperAdmin();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'patient' | 'doctor' | 'seller'>('patient');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!mobileNumber.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter mobile number and password');
      return;
    }

    // Check for super admin login first (bypass mobile number length validation)
    if (mobileNumber === '369369369') {
      setLoading(true);
      try {
        console.log('Checking for super admin login...');
        const superAdmin = await loginSuperAdmin(mobileNumber, password);
        
        if (superAdmin) {
          console.log('Super admin login successful!');
          setRole('super_admin');
          Alert.alert('Success', 'Super Admin login successful!');
          // Navigate to super admin dashboard
          navigation.navigate('SuperAdminDashboard');
          return;
        } else {
          Alert.alert('Error', 'Invalid super admin credentials');
          return;
        }
      } catch (error) {
        Alert.alert('Error', 'Super admin login failed. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Regular user validation
    if (mobileNumber.length < 10) {
      Alert.alert('Error', 'Invalid mobile number');
      return;
    }

    if (password.length < 4) {
      Alert.alert('Error', 'Password must be at least 4 characters');
      return;
    }

    setLoading(true);
    try {
      // Regular user login
      let user = null;
      
      switch (userType) {
        case 'patient':
          user = await loginUser(mobileNumber, password);
          if (user) setRole('patient');
          break;
        case 'doctor':
          user = await loginDoctor(mobileNumber, password);
          if (user) setRole('doctor');
          break;
        case 'seller':
          user = await loginSeller(mobileNumber, password);
          console.log('Seller login result:', user);
          if (user) {
            setRole('seller');
            Alert.alert('Debug', 'Seller login successful, role set to seller.');
          } else {
            Alert.alert('Debug', 'Seller login failed, user not found.');
          }
          break;
      }

      if (!user) {
        Alert.alert(
          'Login Failed',
          'Invalid mobile number or password. Would you like to register?',
          [
            { text: 'Register', onPress: () => navigateToRegistration() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegistration = () => {
    switch (userType) {
      case 'patient':
        navigation.navigate('PatientRegister');
        break;
      case 'doctor':
        navigation.navigate('DoctorRegister');
        break;
      case 'seller':
        navigation.navigate('SellerRegister');
        break;
    }
  };

  const UserTypeButton = ({ type, title, icon }: { type: 'patient' | 'doctor' | 'seller', title: string, icon: string }) => (
    <TouchableOpacity
      style={[
        styles.userTypeButton,
        userType === type && styles.userTypeButtonActive
      ]}
      onPress={() => setUserType(type)}
    >
      <Text style={styles.userTypeIcon}>{icon}</Text>
      <Text style={[
        styles.userTypeText,
        userType === type && styles.userTypeTextActive
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>💊</Text>
          <Text style={styles.title}>MediVoice</Text>
          <Text style={styles.subtitle}>Multilingual Voice Reminders</Text>
        </View>

        <View style={styles.userTypeContainer}>
          <Text style={styles.sectionTitle}>Select User Type</Text>
          <View style={styles.userTypeButtons}>
            <UserTypeButton
              type="patient"
              title="Patient"
              icon="👤"
            />
            <UserTypeButton
              type="doctor"
              title="Doctor"
              icon="👨‍⚕️"
            />
            <UserTypeButton
              type="seller"
              title="Medical Store"
              icon="🏪"
            />
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Login</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerLink}
            onPress={navigateToRegistration}
          >
            <Text style={styles.registerText}>
              Don't have an account? <Text style={styles.registerLinkText}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  userTypeContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  userTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userTypeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  userTypeButtonActive: {
    borderColor: '#3498db',
    backgroundColor: '#ebf8ff',
  },
  userTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  userTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  userTypeTextActive: {
    color: '#3498db',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  loginButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  registerLink: {
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
    color: '#6c757d',
  },
  registerLinkText: {
    color: '#3498db',
    fontWeight: '600',
  },
});

export default MediVoiceLoginScreen; 