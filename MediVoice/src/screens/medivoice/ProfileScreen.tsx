import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useMediVoice } from '../../contexts/MediVoiceContext';
import { useRole } from '../../contexts/RoleContext';
import voiceService from '../../services/voiceService';
import { VoiceSettings, MediVoiceSeller, MediVoiceDoctor } from '../../types';
import { rtdb } from '../../config/firebase';
import { ref, get } from 'firebase/database';

const ProfileScreen: React.FC = () => {
  const { currentUser, currentSeller, currentDoctor, allSellers, allDoctors, updateVoiceSettings, logout } = useMediVoice();
  const { role } = useRole();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [role, currentUser, currentSeller, currentDoctor]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      let userProfile: any = null;
      console.log('=== PROFILE LOADING DEBUG ===');
      console.log('Loading profile for role:', role);
      console.log('Current user:', currentUser?.mobileNumber);
      console.log('Current seller:', currentSeller?.mobileNumber);
      console.log('Current doctor:', currentDoctor?.mobileNumber);
      console.log('All doctors count:', allDoctors?.length);
      console.log('All sellers count:', allSellers?.length);

      if (role === 'seller') {
        // First try currentSeller
        if (currentSeller) {
          userProfile = currentSeller;
          console.log('Using currentSeller from context');
        } else if (currentUser) {
          // Try to fetch from Realtime Database
          console.log('Fetching seller from Realtime Database for:', currentUser.mobileNumber);
          try {
            const sellerRef = ref(rtdb, `users/sellers/${currentUser.mobileNumber}`);
            const snapshot = await get(sellerRef);
            if (snapshot.exists()) {
              const data = snapshot.val();
              console.log('Found seller data in database:', data);
              if (data.password === currentUser.password) {
                userProfile = {
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
                console.log('Created seller profile from database');
              } else {
                console.log('Password mismatch for seller');
              }
            } else {
              console.log('No seller found in database');
            }
          } catch (error) {
            console.error('Error fetching seller from database:', error);
          }
        }
        // Fallback: try to find seller in allSellers
        if (!userProfile && allSellers && allSellers.length > 0 && currentUser) {
          userProfile = allSellers.find(s => s.mobileNumber === currentUser.mobileNumber);
          console.log('Found seller in allSellers fallback:', userProfile ? 'Yes' : 'No');
        }
      } else if (role === 'doctor') {
        // First try currentDoctor
        if (currentDoctor) {
          userProfile = currentDoctor;
          console.log('Using currentDoctor from context');
        } else if (currentUser) {
          // Try to fetch from Realtime Database
          console.log('Fetching doctor from Realtime Database for:', currentUser.mobileNumber);
          try {
            const doctorRef = ref(rtdb, `users/doctors/${currentUser.mobileNumber}`);
            const snapshot = await get(doctorRef);
            if (snapshot.exists()) {
              const data = snapshot.val();
              console.log('Found doctor data in database:', data);
              if (data.password === currentUser.password) {
                userProfile = {
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
                console.log('Created doctor profile from database');
              } else {
                console.log('Password mismatch for doctor');
              }
            } else {
              console.log('No doctor found in database');
            }
          } catch (error) {
            console.error('Error fetching doctor from database:', error);
          }
        }
        // Fallback: try to find doctor in allDoctors
        if (!userProfile && allDoctors && allDoctors.length > 0 && currentUser) {
          userProfile = allDoctors.find(d => d.mobileNumber === currentUser.mobileNumber);
          console.log('Found doctor in allDoctors fallback:', userProfile ? 'Yes' : 'No');
        }
      } else if (role === 'patient') {
        // Patient role
        // First try currentUser
        if (currentUser) {
          userProfile = currentUser;
          console.log('Using currentUser from context');
        } else {
          // Try to fetch from Realtime Database (this should rarely happen)
          console.log('No currentUser found for patient');
        }
      } else {
        userProfile = currentUser;
        console.log('Using currentUser from context (fallback)');
      }

      console.log('Final profile:', userProfile);
      console.log('=== END PROFILE LOADING DEBUG ===');
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(
    profile?.voiceSettings || {
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
    }
  );

  // Update voice settings when profile changes
  useEffect(() => {
    if (profile?.voiceSettings) {
      setVoiceSettings(profile.voiceSettings);
    }
  }, [profile]);

  const handleSaveVoiceSettings = async () => {
    if (!profile) return;
    try {
      await updateVoiceSettings(profile.id, voiceSettings);
      Alert.alert('Success', 'Voice settings updated successfully!');
      setEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update voice settings');
    }
  };

  const handleTestVoice = async () => {
    try {
      await voiceService.testVoice(voiceSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to test voice');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const updateVoiceSetting = (field: string, value: any) => {
    setVoiceSettings(prev => ({ ...prev, [field]: value }));
  };

  const updatePersonalization = (field: string, value: any) => {
    setVoiceSettings(prev => ({
      ...prev,
      personalization: { ...prev.personalization, [field]: value }
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>User not found</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile Settings</Text>
          <Text style={styles.subtitle}>Manage your account and voice preferences</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{profile.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mobile:</Text>
              <Text style={styles.infoValue}>{profile.mobileNumber}</Text>
            </View>
            {profile.email && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{profile.email}</Text>
              </View>
            )}
            {role === 'seller' && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Store Name:</Text>
                  <Text style={styles.infoValue}>{profile.storeName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Store Address:</Text>
                  <Text style={styles.infoValue}>{profile.storeAddress}</Text>
                </View>
                {profile.licenseNumber && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>License Number:</Text>
                    <Text style={styles.infoValue}>{profile.licenseNumber}</Text>
                  </View>
                )}
                {profile.gstNumber && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>GST Number:</Text>
                    <Text style={styles.infoValue}>{profile.gstNumber}</Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Verified:</Text>
                  <Text style={styles.infoValue}>{profile.isVerified ? 'Yes' : 'No'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Assigned Users:</Text>
                  <Text style={styles.infoValue}>{profile.assignedUsers?.length || 0}</Text>
                </View>
              </>
            )}
            {role === 'doctor' && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Specialization:</Text>
                  <Text style={styles.infoValue}>{profile.specialization}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Experience:</Text>
                  <Text style={styles.infoValue}>{profile.experience} years</Text>
                </View>
                {profile.licenseNumber && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>License Number:</Text>
                    <Text style={styles.infoValue}>{profile.licenseNumber}</Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Verified:</Text>
                  <Text style={styles.infoValue}>{profile.isVerified ? 'Yes' : 'No'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Patients:</Text>
                  <Text style={styles.infoValue}>{profile.patients?.length || 0}</Text>
                </View>
              </>
            )}
            {role === 'patient' && (
              <>
                {profile.dateOfBirth && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date of Birth:</Text>
                    <Text style={styles.infoValue}>{profile.dateOfBirth}</Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Gender:</Text>
                  <Text style={styles.infoValue}>{profile.gender}</Text>
                </View>
                {profile.bloodGroup && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Blood Group:</Text>
                    <Text style={styles.infoValue}>{profile.bloodGroup}</Text>
                  </View>
                )}
                {Array.isArray(profile.allergies) && profile.allergies.length > 0 && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Allergies:</Text>
                    <Text style={styles.infoValue}>{profile.allergies.join(', ')}</Text>
                  </View>
                )}
              </>
            )}
            {role !== 'patient' && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gender:</Text>
                <Text style={styles.infoValue}>{profile.gender}</Text>
              </View>
            )}
            {role !== 'patient' && profile.bloodGroup && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Blood Group:</Text>
                <Text style={styles.infoValue}>{profile.bloodGroup}</Text>
              </View>
            )}
            {role !== 'patient' && Array.isArray(profile.allergies) && profile.allergies.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Allergies:</Text>
                <Text style={styles.infoValue}>{profile.allergies.join(', ')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Voice Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Voice Settings</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(!editing)}
            >
              <Text style={styles.editButtonText}>
                {editing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.voiceCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Voice Reminders</Text>
              <Switch
                value={voiceSettings.enabled}
                onValueChange={(value) => updateVoiceSetting('enabled', value)}
                disabled={!editing}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Language</Text>
              {editing ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={voiceSettings.language}
                    style={styles.picker}
                    onValueChange={(value: string) => updateVoiceSetting('language', value)}
                  >
                    <Picker.Item label="English" value="en-IN" />
                    <Picker.Item label="Hindi" value="hi-IN" />
                    <Picker.Item label="Telugu" value="te-IN" />
                    <Picker.Item label="Tamil" value="ta-IN" />
                    <Picker.Item label="Kannada" value="kn-IN" />
                    <Picker.Item label="Malayalam" value="ml-IN" />
                  </Picker>
                </View>
              ) : (
                <Text style={styles.settingValue}>
                  {voiceSettings.language === 'en-IN' ? 'English' :
                   voiceSettings.language === 'hi-IN' ? 'Hindi' :
                   voiceSettings.language === 'te-IN' ? 'Telugu' :
                   voiceSettings.language === 'ta-IN' ? 'Tamil' :
                   voiceSettings.language === 'kn-IN' ? 'Kannada' : 'Malayalam'}
                </Text>
              )}
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Voice Type</Text>
              {editing ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={voiceSettings.voiceType}
                    style={styles.picker}
                    onValueChange={(value: string) => updateVoiceSetting('voiceType', value)}
                  >
                    <Picker.Item label="Female" value="female" />
                    <Picker.Item label="Male" value="male" />
                  </Picker>
                </View>
              ) : (
                <Text style={styles.settingValue}>
                  {voiceSettings.voiceType === 'female' ? 'Female' : 'Male'}
                </Text>
              )}
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Volume</Text>
              {editing ? (
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderValue}>{Math.round(voiceSettings.volume * 100)}%</Text>
                </View>
              ) : (
                <Text style={styles.settingValue}>{Math.round(voiceSettings.volume * 100)}%</Text>
              )}
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Speed</Text>
              {editing ? (
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderValue}>{Math.round(voiceSettings.rate * 100)}%</Text>
                </View>
              ) : (
                <Text style={styles.settingValue}>{Math.round(voiceSettings.rate * 100)}%</Text>
              )}
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Pitch</Text>
              {editing ? (
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderValue}>{Math.round(voiceSettings.pitch * 100)}%</Text>
                </View>
              ) : (
                <Text style={styles.settingValue}>{Math.round(voiceSettings.pitch * 100)}%</Text>
              )}
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Use My Name</Text>
              <Switch
                value={voiceSettings.personalization.useName}
                onValueChange={(value) => updatePersonalization('useName', value)}
                disabled={!editing}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Use My Gender</Text>
              <Switch
                value={voiceSettings.personalization.useGender}
                onValueChange={(value) => updatePersonalization('useGender', value)}
                disabled={!editing}
              />
            </View>

            {editing && (
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={handleTestVoice}
                >
                  <Text style={styles.testButtonText}>🔊 Test Voice</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveVoiceSettings}
                >
                  <Text style={styles.saveButtonText}>Save Settings</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Emergency Contacts */}
        {Array.isArray(profile.emergencyContacts) && profile.emergencyContacts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <View style={styles.emergencyCard}>
              {profile.emergencyContacts.map((contact: any, index: number) => (
                <View key={index} style={styles.contactRow}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                  <Text style={styles.contactRelation}>{contact.relationship}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>🚪 Logout</Text>
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
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  editButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  infoValue: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  voiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  settingValue: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    width: 120,
  },
  picker: {
    height: 40,
  },
  sliderContainer: {
    alignItems: 'center',
    width: 80,
  },
  sliderValue: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
  },
  editActions: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testButton: {
    flex: 1,
    backgroundColor: '#f39c12',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emergencyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  contactPhone: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
  },
  contactRelation: {
    fontSize: 12,
    color: '#95a5a6',
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 18,
    color: '#7f8c8d',
  },
});

export default ProfileScreen; 