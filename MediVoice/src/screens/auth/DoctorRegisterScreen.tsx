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
import { Picker } from '@react-native-picker/picker';
import { useMediVoice } from '../../contexts/MediVoiceContext';
import { VoiceSettings } from '../../types';

const DoctorRegisterScreen: React.FC = ({ navigation }: any) => {
  const { registerDoctor } = useMediVoice();
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    email: '',
    specialization: '',
    licenseNumber: '',
    experience: '',
    hospital: '',
    consultationFee: '',
    preferredLanguage: 'en-IN' as VoiceSettings['language'],
  });
  const [loading, setLoading] = useState(false);

  const specializations = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'General Medicine',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Pulmonology',
    'Radiology',
    'Surgery',
    'Other',
  ];

  const handleRegister = async () => {
    if (!formData.name.trim() || !formData.mobileNumber.trim() || 
        !formData.password.trim() || !formData.confirmPassword.trim() ||
        !formData.specialization.trim() || !formData.licenseNumber.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.mobileNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }

    if (formData.password.length < 4) {
      Alert.alert('Error', 'Password must be at least 4 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const doctorData = {
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        password: formData.password,
        email: formData.email,
        specialization: formData.specialization,
        experience: parseInt(formData.experience) || 0,
        licenseNumber: formData.licenseNumber,
        voiceSettings: {
          language: formData.preferredLanguage,
          voiceType: 'female' as const,
          volume: 1.0,
          rate: 1.0,
          pitch: 1.0,
          enabled: true,
          personalization: {
            useName: true,
            useGender: false,
          },
        },
      };

      await registerDoctor(doctorData);
      Alert.alert('Success', 'Registration successful! You can now login.', [
        { text: 'OK', onPress: () => navigation.navigate('MediVoiceLogin') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>👨‍⚕️</Text>
          <Text style={styles.title}>Doctor Registration</Text>
          <Text style={styles.subtitle}>Join MediVoice as a Healthcare Provider</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mobile Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.mobileNumber}
              onChangeText={(value) => updateFormData('mobileNumber', value)}
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password *</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              placeholder="Enter password (min 4 characters)"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password *</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              placeholder="Confirm password"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.sectionTitle}>Professional Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Specialization *</Text>
            <TextInput
              style={styles.input}
              value={formData.specialization}
              onChangeText={(value) => updateFormData('specialization', value)}
              placeholder="e.g., Cardiologist, Pediatrician"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Medical License Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.licenseNumber}
              onChangeText={(value) => updateFormData('licenseNumber', value)}
              placeholder="Enter medical license number"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Years of Experience</Text>
            <TextInput
              style={styles.input}
              value={formData.experience}
              onChangeText={(value) => updateFormData('experience', value)}
              placeholder="Enter years of experience"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Hospital/Clinic</Text>
            <TextInput
              style={styles.input}
              value={formData.hospital}
              onChangeText={(value) => updateFormData('hospital', value)}
              placeholder="Enter hospital or clinic name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Consultation Fee (₹)</Text>
            <TextInput
              style={styles.input}
              value={formData.consultationFee}
              onChangeText={(value) => updateFormData('consultationFee', value)}
              placeholder="Enter consultation fee"
              keyboardType="numeric"
            />
          </View>

          <Text style={styles.sectionTitle}>Voice Settings</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Preferred Language for Voice Reminders</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.preferredLanguage}
                style={styles.picker}
                onValueChange={(value: string) => updateFormData('preferredLanguage', value)}
              >
                <Picker.Item label="English" value="en-IN" />
                <Picker.Item label="Hindi" value="hi-IN" />
                <Picker.Item label="Telugu" value="te-IN" />
                <Picker.Item label="Tamil" value="ta-IN" />
                <Picker.Item label="Kannada" value="kn-IN" />
                <Picker.Item label="Malayalam" value="ml-IN" />
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Registering...' : 'Register Doctor'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => navigation.navigate('MediVoiceLogin')}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLinkText}>Login</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
    marginTop: 8,
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
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  picker: {
    height: 50,
  },
  registerButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  registerButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#6c757d',
  },
  loginLinkText: {
    color: '#27ae60',
    fontWeight: '600',
  },
});

export default DoctorRegisterScreen; 