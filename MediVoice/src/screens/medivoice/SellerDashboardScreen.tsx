import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Modal,
  Button,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useMediVoice } from '../../contexts/MediVoiceContext';
import { MediVoiceUser, MedicineAssignment } from '../../types';
import { fetchPatientFromFirebase } from '../../services/patientService';
import { ref, get } from 'firebase/database';
import { rtdb } from '../../config/firebase';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';

// Mock patient DB for demonstration
const mockPatients = [
  { id: '1', name: 'Ramesh', mobile: '9999999999', age: 62, gender: 'Male' },
  { id: '2', name: 'Sita', mobile: '8888888888', age: 45, gender: 'Female' },
];

const commonMedicines = ["Paracetamol", "Ibuprofen", "Cetirizine", "Metformin", "Amoxicillin"];
const commonDosages = ["1 tablet", "2 tablets", "5ml", "10ml"];
const commonColors = ["Red", "Yellow", "Blue", "Green", "White"];
const commonShapes = ["Round", "Oval", "Capsule", "Square"];
const commonInstructions = ["After food", "Before food", "Before bed", "With water"];
const commonTimings = [
  { label: "Morning", value: "08:00" },
  { label: "Afternoon", value: "14:00" },
  { label: "Night", value: "20:00" },
];

type AssignMedicineModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedUser: MediVoiceUser | null;
  medicineForm: {
    medicineName: string;
    dosage: string;
    color: string;
    shape: string;
    photoUrl: string;
    instructions: string;
    timings: string[];
    customTime: string;
    startDate: string;
    endDate: string;
    duration: string;
    notes: string;
  };
  updateMedicineForm: (field: string, value: any) => void;
  handleAssignMedicine: () => void;
  handleAddTiming: () => void;
  handleRemoveTiming: (time: string) => void;
  pickImage: () => void;
  commonMedicines: string[];
  commonDosages: string[];
  commonColors: string[];
  commonShapes: string[];
  commonInstructions: string[];
  commonTimings: { label: string; value: string }[];
};

type PatientDetailsModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedUser: MediVoiceUser | null;
  onAssignMedicine: () => void;
};

const SellerDashboardScreen = ({ navigation }: any) => {
  const { currentSeller, allUsers, assignMedicine } = useMediVoice();
  const [searchMobile, setSearchMobile] = useState('');
  const [selectedUser, setSelectedUser] = useState<MediVoiceUser | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [medicineForm, setMedicineForm] = useState<{
    medicineName: string;
    dosage: string;
    color: string;
    shape: string;
    photoUrl: string;
    instructions: string;
    timings: string[];
    customTime: string;
    startDate: string;
    endDate: string;
    duration: string;
    notes: string;
  }>(
    {
    medicineName: '',
    dosage: '',
      color: '',
      shape: '',
      photoUrl: '',
      instructions: '',
      timings: [],
      customTime: '',
    startDate: '',
    endDate: '',
      duration: '',
      notes: '',
    }
  );
  const [mobile, setMobile] = useState('');
  const [patient, setPatient] = useState<any>(null);
  const [searchError, setSearchError] = useState('');
  const [searchResults, setSearchResults] = useState<MediVoiceUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);

  const handleSearchUser = async () => {
    if (!searchMobile.trim()) {
      Alert.alert('Error', 'Please enter a mobile number');
      return;
    }

    // Always search in Firebase
    const patient = await fetchPatientFromFirebase(searchMobile.trim());
    if (patient) {
      setSelectedUser(patient);
    } else {
      Alert.alert('User Not Found', 'No patient found with this mobile number');
    }
  };

  const handleAssignMedicine = async () => {
    if (!selectedUser || !currentSeller) return;
    if (!medicineForm.medicineName.trim() || !medicineForm.dosage.trim() || !medicineForm.startDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    try {
      await assignMedicine({
        userId: selectedUser.mobileNumber,
        assignedBy: currentSeller.mobileNumber,
        assignedByType: 'seller',
        medicineName: medicineForm.medicineName,
        dosage: medicineForm.dosage,
        color: medicineForm.color,
        shape: medicineForm.shape,
        photoUrl: medicineForm.photoUrl,
        instructions: medicineForm.instructions,
        timings: medicineForm.timings,
        startDate: medicineForm.startDate,
        endDate: medicineForm.endDate || undefined,
        duration: medicineForm.duration,
        notes: medicineForm.notes,
        isActive: true,
      });
      Alert.alert('Success', 'Medicine assigned successfully!');
      setShowAssignModal(false);
      setMedicineForm({
        medicineName: '',
        dosage: '',
        color: '',
        shape: '',
        photoUrl: '',
        instructions: '',
        timings: [],
        customTime: '',
        startDate: '',
        endDate: '',
        duration: '',
        notes: '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to assign medicine');
    }
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setMedicineForm({
      medicineName: '',
      dosage: '',
      color: '',
      shape: '',
      photoUrl: '',
      instructions: '',
      timings: [],
      customTime: '',
      startDate: '',
      endDate: '',
      duration: '',
      notes: '',
    });
  };

  const pickImage = async () => {
    let result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setMedicineForm(prev => ({ ...prev, photoUrl: result.assets[0].uri }));
    }
  };

  const updateMedicineForm = (field: string, value: any) => {
    setMedicineForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTiming = () => {
    if (medicineForm.customTime && !medicineForm.timings.includes(medicineForm.customTime)) {
      setMedicineForm(prev => ({ ...prev, timings: [...prev.timings, prev.customTime], customTime: '' }));
    }
  };

  const handleRemoveTiming = (time: string) => {
    setMedicineForm(prev => ({ ...prev, timings: prev.timings.filter(t => t !== time) }));
  };

  const handleSearch = () => {
    const found = mockPatients.find((p) => p.mobile === mobile);
    if (found) {
      setPatient(found);
      setSearchError('');
    } else {
      setPatient(null);
      setSearchError('Patient not found');
    }
  };

  const handleLiveSearch = async (input: string) => {
    setSearchMobile(input);
    if (!input.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      // Fetch all patients from Firebase
      const patientsRef = ref(rtdb, 'users/patients');
      const snapshot = await get(patientsRef);
      let results: MediVoiceUser[] = [];
      if (snapshot.exists()) {
        snapshot.forEach(child => {
          const data = child.val();
          if (data.mobileNumber && data.mobileNumber.includes(input.trim())) {
            results.push(data);
          }
        });
      }
      setSearchResults(results);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPatient = (patient: MediVoiceUser) => {
    navigation.navigate('AssignMedicine', { patient });
  };

  // AssignMedicineModal as a stable component
  const AssignMedicineModal = ({
    visible,
    onClose,
    selectedUser,
    medicineForm,
    updateMedicineForm,
    handleAssignMedicine,
    handleAddTiming,
    handleRemoveTiming,
    pickImage,
    commonMedicines,
    commonDosages,
    commonColors,
    commonShapes,
    commonInstructions,
    commonTimings,
  }: AssignMedicineModalProps) => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Assign Medicine</Text>
          <Text style={styles.modalSubtitle}>
            Assigning to: {selectedUser?.name} ({selectedUser?.mobileNumber})
          </Text>
          <ScrollView style={styles.modalScroll}>
            {/* Medicine Name */}
              <Text style={styles.inputLabel}>Medicine Name *</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {commonMedicines.map(name => (
                <TouchableOpacity key={name} style={[styles.quickButton, medicineForm.medicineName === name && styles.quickButtonActive]} onPress={() => updateMedicineForm('medicineName', name)}>
                  <Text>{name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} value={medicineForm.medicineName} onChangeText={v => updateMedicineForm('medicineName', v)} placeholder="Custom medicine name" />
            {/* Dosage */}
              <Text style={styles.inputLabel}>Dosage *</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {commonDosages.map(dosage => (
                <TouchableOpacity key={dosage} style={[styles.quickButton, medicineForm.dosage === dosage && styles.quickButtonActive]} onPress={() => updateMedicineForm('dosage', dosage)}>
                  <Text>{dosage}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} value={medicineForm.dosage} onChangeText={v => updateMedicineForm('dosage', v)} placeholder="Custom dosage" />
            {/* Color */}
            <Text style={styles.inputLabel}>Color *</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {commonColors.map(color => (
                <TouchableOpacity key={color} style={[styles.quickButton, { backgroundColor: color.toLowerCase() }, medicineForm.color === color && styles.quickButtonActive]} onPress={() => updateMedicineForm('color', color)}>
                  <Text style={{ color: color === 'White' ? '#333' : '#fff' }}>{color}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} value={medicineForm.color} onChangeText={v => updateMedicineForm('color', v)} placeholder="Custom color" />
            {/* Shape */}
            <Text style={styles.inputLabel}>Shape</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {commonShapes.map(shape => (
                <TouchableOpacity key={shape} style={[styles.quickButton, medicineForm.shape === shape && styles.quickButtonActive]} onPress={() => updateMedicineForm('shape', shape)}>
                  <Text>{shape}</Text>
                </TouchableOpacity>
              ))}
              </View>
            <TextInput style={styles.input} value={medicineForm.shape} onChangeText={v => updateMedicineForm('shape', v)} placeholder="Custom shape" />
            {/* Photo */}
            <Text style={styles.inputLabel}>Photo (optional)</Text>
            <TouchableOpacity style={styles.quickButton} onPress={pickImage}>
              <Text>Pick Photo</Text>
            </TouchableOpacity>
            {medicineForm.photoUrl ? <Text>Photo selected</Text> : null}
            {/* Instructions */}
            <Text style={styles.inputLabel}>Instructions *</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {commonInstructions.map(instr => (
                <TouchableOpacity key={instr} style={[styles.quickButton, medicineForm.instructions === instr && styles.quickButtonActive]} onPress={() => updateMedicineForm('instructions', instr)}>
                  <Text>{instr}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} value={medicineForm.instructions} onChangeText={v => updateMedicineForm('instructions', v)} placeholder="Custom instructions" />
            {/* Timings */}
            <Text style={styles.inputLabel}>Timings *</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {commonTimings.map((t: { label: string; value: string }) => (
                <TouchableOpacity key={t.value} style={[styles.quickButton, medicineForm.timings.includes(t.value) && styles.quickButtonActive]} onPress={() => updateMedicineForm('timings', medicineForm.timings.includes(t.value) ? medicineForm.timings.filter((tm: string) => tm !== t.value) : [...medicineForm.timings, t.value])}>
                  <Text>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TextInput style={[styles.input, { flex: 1 }]} value={medicineForm.customTime} onChangeText={v => updateMedicineForm('customTime', v)} placeholder="Custom time (e.g., 15:30)" />
              <TouchableOpacity style={styles.quickButton} onPress={handleAddTiming}><Text>Add</Text></TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {medicineForm.timings.map((time: string) => (
                <TouchableOpacity key={time} style={[styles.quickButton, { backgroundColor: '#eee' }]} onPress={() => handleRemoveTiming(time)}>
                  <Text>{time} ✕</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Duration */}
            <Text style={styles.inputLabel}>Duration (days)</Text>
            <TextInput style={styles.input} value={medicineForm.duration} onChangeText={v => updateMedicineForm('duration', v)} placeholder="e.g., 5" keyboardType="numeric" />
            {/* Start Date */}
            <Text style={styles.inputLabel}>Start Date *</Text>
            <TextInput style={styles.input} value={medicineForm.startDate} onChangeText={v => updateMedicineForm('startDate', v)} placeholder="YYYY-MM-DD" />
            {/* End Date */}
            <Text style={styles.inputLabel}>End Date (optional)</Text>
            <TextInput style={styles.input} value={medicineForm.endDate} onChangeText={v => updateMedicineForm('endDate', v)} placeholder="YYYY-MM-DD (leave empty for ongoing)" />
            {/* Notes */}
            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput style={styles.input} value={medicineForm.notes} onChangeText={v => updateMedicineForm('notes', v)} placeholder="Any extra notes" />
          </ScrollView>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.assignButton}
              onPress={handleAssignMedicine}
            >
              <Text style={styles.assignButtonText}>Assign Medicine</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // PatientDetailsModal as a stable component
  const PatientDetailsModal = ({
    visible,
    onClose,
    selectedUser,
    onAssignMedicine,
  }: PatientDetailsModalProps) => (
    <Modal
      visible={visible && !!selectedUser}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Patient Details</Text>
          <Text style={styles.modalSubtitle}>{selectedUser?.name} ({selectedUser?.mobileNumber})</Text>
          <ScrollView style={styles.modalScroll}>
            <Text style={styles.inputLabel}>Gender: {selectedUser?.gender}</Text>
            {selectedUser?.bloodGroup && <Text style={styles.inputLabel}>Blood Group: {selectedUser.bloodGroup}</Text>}
            {Array.isArray(selectedUser?.allergies) && selectedUser.allergies.length > 0 && (
              <Text style={styles.inputLabel}>Allergies: {selectedUser.allergies.join(', ')}</Text>
            )}
            <Text style={styles.inputLabel}>Preferred Language: {selectedUser?.preferredLanguage}</Text>
          </ScrollView>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.assignButton} onPress={onAssignMedicine}>
              <Text style={styles.assignButtonText}>Assign Medicine</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome, {currentSeller?.name}! 🏪
          </Text>
          <Text style={styles.subtitle}>Search patients and assign medicines</Text>
        </View>

        {/* Search Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Patient</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchMobile}
              onChangeText={handleLiveSearch}
              placeholder="Enter patient mobile number"
              keyboardType="phone-pad"
              maxLength={10}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => {}}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Results */}
        <View style={styles.searchResultsContainer}>
          {searching ? (
            <Text>Searching...</Text>
          ) : searchResults.length > 0 ? (
            searchResults.map(patient => (
              <TouchableOpacity key={patient.mobileNumber} onPress={() => handleSelectPatient(patient)} style={styles.searchResultItem}>
                <Text>{patient.name} ({patient.mobileNumber})</Text>
              </TouchableOpacity>
            ))
          ) : searchMobile.trim() && !searching ? (
            <Text>No patient with this number exists in the database.</Text>
          ) : null}
        </View>

        {/* User Details */}
        {patient && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Patient Details</Text>
            <View style={styles.userCard}>
              <View style={styles.userHeader}>
                <Text style={styles.userName}>{patient.name}</Text>
                <Text style={styles.userPhone}>{patient.mobile}</Text>
              </View>
              
              <View style={styles.userInfo}>
                <Text style={styles.userInfoText}>
                  <Text style={styles.label}>Gender:</Text> {patient.gender}
                </Text>
                {patient.bloodGroup && (
                  <Text style={styles.userInfoText}>
                    <Text style={styles.label}>Blood Group:</Text> {patient.bloodGroup}
                  </Text>
                )}
                {patient.allergies.length > 0 && (
                  <Text style={styles.userInfoText}>
                    <Text style={styles.label}>Allergies:</Text> {patient.allergies.join(', ')}
                  </Text>
                )}
                <Text style={styles.userInfoText}>
                  <Text style={styles.label}>Preferred Language:</Text> {patient.preferredLanguage}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.assignButton}
                onPress={() => navigation.navigate('AssignMedicine', { patient })}
              >
                <Text style={styles.assignButtonText}>💊 Assign Medicine</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Store Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Information</Text>
          <View style={styles.storeCard}>
            <Text style={styles.storeName}>{currentSeller?.storeName}</Text>
            <Text style={styles.storeAddress}>{currentSeller?.storeAddress}</Text>
            <Text style={styles.storeStats}>
              Patients assigned: {currentSeller?.assignedUsers.length || 0}
            </Text>
          </View>
        </View>
      </ScrollView>

      <PatientDetailsModal
        visible={showPatientModal}
        onClose={() => { setShowPatientModal(false); setSelectedUser(null); }}
        selectedUser={selectedUser}
        onAssignMedicine={() => setShowAssignModal(true)}
      />
      <AssignMedicineModal
        visible={showAssignModal}
        onClose={handleCloseAssignModal}
        selectedUser={selectedUser}
        medicineForm={medicineForm}
        updateMedicineForm={updateMedicineForm}
        handleAssignMedicine={handleAssignMedicine}
        handleAddTiming={handleAddTiming}
        handleRemoveTiming={handleRemoveTiming}
        pickImage={pickImage}
        commonMedicines={commonMedicines}
        commonDosages={commonDosages}
        commonColors={commonColors}
        commonShapes={commonShapes}
        commonInstructions={commonInstructions}
        commonTimings={commonTimings}
      />

      <View style={styles.buttonContainer}>
        <Button title="Search Patient by Mobile" onPress={() => {}} />
        <Button title="Assign New Medicine" onPress={() => navigation.navigate('AssignMedicine')} />
      </View>
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
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  welcomeText: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginRight: 12,
  },
  searchButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  userInfo: {
    marginBottom: 16,
  },
  userInfoText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 4,
  },
  label: {
    fontWeight: '600',
  },
  assignButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  assignButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  storeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  storeStats: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 400,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#95a5a6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  searchResultsContainer: {
    padding: 20,
  },
  searchResultItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    marginBottom: 8,
  },
  quickButton: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  quickButtonActive: {
    backgroundColor: '#3498db',
    color: '#fff',
  },
});

export default SellerDashboardScreen; 