import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMediVoice } from '../../contexts/MediVoiceContext';
import { MediVoiceUser, MedicineAssignment } from '../../types';
// @ts-ignore
import DateTimePicker from '@react-native-community/datetimepicker';

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

const AssignMedicineScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { assignMedicine, currentSeller } = useMediVoice();
  const patient: MediVoiceUser = route.params?.patient;

  const [assignedMedicines, setAssignedMedicines] = useState<Partial<MedicineAssignment>[]>([]);
  const [medicineForm, setMedicineForm] = useState({
    medicineName: '',
    dosage: '',
    color: '',
    shape: '',
    photoUrl: '',
    instructions: '',
    timings: [] as string[],
    customTime: '',
    startDate: '',
    endDate: '',
    duration: '',
    notes: '',
    showStartDatePicker: false,
    showEndDatePicker: false,
  });

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

  const resetForm = () => {
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
      showStartDatePicker: false,
      showEndDatePicker: false,
    });
  };

  const validateForm = () => {
    if (!medicineForm.medicineName.trim() || !medicineForm.dosage.trim() || !medicineForm.startDate) {
      Alert.alert('Error', 'Please fill in all required fields (Medicine Name, Dosage, Start Date)');
      return false;
    }
    if (medicineForm.timings.length === 0) {
      Alert.alert('Error', 'Please select at least one timing');
      return false;
    }
    return true;
  };

  const handleSaveAndAddAnother = async () => {
    if (!validateForm()) return;

    const newMedicine = {
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
    };

    setAssignedMedicines(prev => [...prev, newMedicine]);
    resetForm();
    Alert.alert('Success', 'Medicine added to list! Add more medicines or finish assignment.');
  };

  const handleRemoveMedicine = (index: number) => {
    setAssignedMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinishAssignment = async () => {
    if (assignedMedicines.length === 0) {
      Alert.alert('Error', 'Please add at least one medicine before finishing');
      return;
    }

    if (!patient || !currentSeller) {
      Alert.alert('Error', 'Patient or seller information not found');
      return;
    }

    try {
      // Assign all medicines
      for (const medicine of assignedMedicines) {
        await assignMedicine({
          userId: patient.mobileNumber,
          assignedBy: currentSeller.mobileNumber,
          assignedByType: 'seller',
          medicineName: medicine.medicineName!,
          dosage: medicine.dosage!,
          color: medicine.color,
          shape: medicine.shape,
          photoUrl: medicine.photoUrl,
          instructions: medicine.instructions!,
          timings: medicine.timings!,
          startDate: medicine.startDate!,
          endDate: medicine.endDate,
          duration: medicine.duration,
          notes: medicine.notes,
          isActive: true,
        });
      }

      Alert.alert(
        'Success', 
        `${assignedMedicines.length} medicine(s) assigned successfully!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to assign medicines');
    }
  };

  const formatTime = (timeString: string): string => {
    const date = new Date(`2000-01-01T${timeString}`);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.patientCard}>
          <Text style={styles.patientTitle}>Patient Details</Text>
          <Text style={styles.patientName}>{patient?.name} ({patient?.mobileNumber})</Text>
          <Text style={styles.patientInfo}>Gender: {patient?.gender}</Text>
          {patient?.bloodGroup && <Text style={styles.patientInfo}>Blood Group: {patient.bloodGroup}</Text>}
          {Array.isArray(patient?.allergies) && patient.allergies.length > 0 && (
            <Text style={styles.patientInfo}>Allergies: {patient.allergies.join(', ')}</Text>
          )}
          <Text style={styles.patientInfo}>Preferred Language: {patient?.preferredLanguage}</Text>
        </View>

        {/* Assigned Medicines List */}
        {assignedMedicines.length > 0 && (
          <View style={styles.assignedMedicinesSection}>
            <Text style={styles.sectionTitle}>Medicines to Assign ({assignedMedicines.length})</Text>
            {assignedMedicines.map((medicine, index) => (
              <View key={index} style={styles.assignedMedicineCard}>
                <View style={styles.assignedMedicineHeader}>
                  <Text style={styles.assignedMedicineName}>{medicine.medicineName}</Text>
                  <TouchableOpacity 
                    style={styles.removeButton} 
                    onPress={() => handleRemoveMedicine(index)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.assignedMedicineDetail}>Dosage: {medicine.dosage}</Text>
                {medicine.color && <Text style={styles.assignedMedicineDetail}>Color: {medicine.color}</Text>}
                {medicine.shape && <Text style={styles.assignedMedicineDetail}>Shape: {medicine.shape}</Text>}
                <Text style={styles.assignedMedicineDetail}>Instructions: {medicine.instructions}</Text>
                <Text style={styles.assignedMedicineDetail}>
                  Timings: {medicine.timings?.map(formatTime).join(', ')}
                </Text>
                <Text style={styles.assignedMedicineDetail}>Start Date: {medicine.startDate}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>
            {assignedMedicines.length > 0 ? 'Add Another Medicine' : 'Assign Medicine'}
          </Text>
          
          {/* Medicine Name */}
          <Text style={styles.inputLabel}>Medicine Name *</Text>
          <View style={styles.quickRow}>
            {commonMedicines.map(name => (
              <TouchableOpacity key={name} style={[styles.quickButton, medicineForm.medicineName === name && styles.quickButtonActive]} onPress={() => updateMedicineForm('medicineName', name)}>
                <Text style={medicineForm.medicineName === name ? styles.quickButtonTextActive : styles.quickButtonText}>{name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={styles.input} value={medicineForm.medicineName} onChangeText={v => updateMedicineForm('medicineName', v)} placeholder="Custom medicine name" />
          
          {/* Dosage */}
          <Text style={styles.inputLabel}>Dosage *</Text>
          <View style={styles.quickRow}>
            {commonDosages.map(dosage => (
              <TouchableOpacity key={dosage} style={[styles.quickButton, medicineForm.dosage === dosage && styles.quickButtonActive]} onPress={() => updateMedicineForm('dosage', dosage)}>
                <Text style={medicineForm.dosage === dosage ? styles.quickButtonTextActive : styles.quickButtonText}>{dosage}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={styles.input} value={medicineForm.dosage} onChangeText={v => updateMedicineForm('dosage', v)} placeholder="Custom dosage" />
          
          {/* Color */}
          <Text style={styles.inputLabel}>Color *</Text>
          <View style={styles.quickRow}>
            {commonColors.map(color => (
              <TouchableOpacity key={color} style={[styles.quickButton, { backgroundColor: color.toLowerCase() }, medicineForm.color === color && styles.quickButtonActive]} onPress={() => updateMedicineForm('color', color)}>
                <Text style={{ color: color === 'White' ? '#333' : '#fff' }}>{color}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={styles.input} value={medicineForm.color} onChangeText={v => updateMedicineForm('color', v)} placeholder="Custom color" />
          
          {/* Shape */}
          <Text style={styles.inputLabel}>Shape</Text>
          <View style={styles.quickRow}>
            {commonShapes.map(shape => (
              <TouchableOpacity key={shape} style={[styles.quickButton, medicineForm.shape === shape && styles.quickButtonActive]} onPress={() => updateMedicineForm('shape', shape)}>
                <Text style={medicineForm.shape === shape ? styles.quickButtonTextActive : styles.quickButtonText}>{shape}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={styles.input} value={medicineForm.shape} onChangeText={v => updateMedicineForm('shape', v)} placeholder="Custom shape" />
          
          {/* Instructions */}
          <Text style={styles.inputLabel}>Instructions *</Text>
          <View style={styles.quickRow}>
            {commonInstructions.map(instr => (
              <TouchableOpacity key={instr} style={[styles.quickButton, medicineForm.instructions === instr && styles.quickButtonActive]} onPress={() => updateMedicineForm('instructions', instr)}>
                <Text style={medicineForm.instructions === instr ? styles.quickButtonTextActive : styles.quickButtonText}>{instr}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={styles.input} value={medicineForm.instructions} onChangeText={v => updateMedicineForm('instructions', v)} placeholder="Custom instructions" />
          
          {/* Timings */}
          <Text style={styles.inputLabel}>Timings *</Text>
          <View style={styles.quickRow}>
            {commonTimings.map(t => (
              <TouchableOpacity key={t.value} style={[styles.quickButton, medicineForm.timings.includes(t.value) && styles.quickButtonActive]} onPress={() => updateMedicineForm('timings', medicineForm.timings.includes(t.value) ? medicineForm.timings.filter(tm => tm !== t.value) : [...medicineForm.timings, t.value])}>
                <Text style={medicineForm.timings.includes(t.value) ? styles.quickButtonTextActive : styles.quickButtonText}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <TextInput style={[styles.input, { flex: 1 }]} value={medicineForm.customTime} onChangeText={v => updateMedicineForm('customTime', v)} placeholder="Custom time (e.g., 15:30)" />
            <TouchableOpacity style={styles.quickButton} onPress={handleAddTiming}><Text>Add</Text></TouchableOpacity>
          </View>
          <View style={styles.quickRow}>
            {medicineForm.timings.map(time => (
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
          <TouchableOpacity onPress={() => updateMedicineForm('showStartDatePicker', true)} style={styles.input}>
            <Text>{medicineForm.startDate ? medicineForm.startDate : 'Select start date'}</Text>
          </TouchableOpacity>
          {medicineForm.showStartDatePicker && (
            <DateTimePicker
              value={medicineForm.startDate ? new Date(medicineForm.startDate) : new Date()}
              mode="date"
              display="default"
              onChange={(event: any, selectedDate?: Date) => {
                updateMedicineForm('showStartDatePicker', false);
                if (selectedDate) {
                  const iso = selectedDate.toISOString().split('T')[0];
                  updateMedicineForm('startDate', iso);
                }
              }}
            />
          )}
          
          {/* End Date */}
          <Text style={styles.inputLabel}>End Date (optional)</Text>
          <TouchableOpacity onPress={() => updateMedicineForm('showEndDatePicker', true)} style={styles.input}>
            <Text>{medicineForm.endDate ? medicineForm.endDate : 'Select end date (optional)'}</Text>
          </TouchableOpacity>
          {medicineForm.showEndDatePicker && (
            <DateTimePicker
              value={medicineForm.endDate ? new Date(medicineForm.endDate) : new Date()}
              mode="date"
              display="default"
              onChange={(event: any, selectedDate?: Date) => {
                updateMedicineForm('showEndDatePicker', false);
                if (selectedDate) {
                  const iso = selectedDate.toISOString().split('T')[0];
                  updateMedicineForm('endDate', iso);
                }
              }}
            />
          )}
          
          {/* Notes */}
          <Text style={styles.inputLabel}>Notes (optional)</Text>
          <TextInput style={styles.input} value={medicineForm.notes} onChangeText={v => updateMedicineForm('notes', v)} placeholder="Any extra notes" />
          
          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveAndAddButton} onPress={handleSaveAndAddAnother}>
              <Text style={styles.saveAndAddButtonText}>Save & Add Another</Text>
            </TouchableOpacity>
            
            {assignedMedicines.length > 0 && (
              <TouchableOpacity style={styles.finishButton} onPress={handleFinishAssignment}>
                <Text style={styles.finishButtonText}>Finish Assignment ({assignedMedicines.length})</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { padding: 20 },
  patientCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, elevation: 2 },
  patientTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 },
  patientName: { fontSize: 16, fontWeight: '600', color: '#3498db', marginBottom: 4 },
  patientInfo: { fontSize: 14, color: '#34495e', marginBottom: 2 },
  assignedMedicinesSection: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, elevation: 2 },
  assignedMedicineCard: { backgroundColor: '#f8f9fa', borderRadius: 8, padding: 12, marginBottom: 8 },
  assignedMedicineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  assignedMedicineName: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  assignedMedicineDetail: { fontSize: 12, color: '#7f8c8d', marginBottom: 2 },
  removeButton: { backgroundColor: '#e74c3c', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  removeButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  formSection: { backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#2c3e50', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#e1e8ed', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f8f9fa', marginBottom: 8 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  quickButton: { backgroundColor: '#f1f1f1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, margin: 4 },
  quickButtonActive: { backgroundColor: '#3498db' },
  quickButtonText: { color: '#2c3e50' },
  quickButtonTextActive: { color: '#fff' },
  buttonContainer: { marginTop: 16 },
  saveAndAddButton: { backgroundColor: '#27ae60', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 8 },
  saveAndAddButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  finishButton: { backgroundColor: '#e67e22', borderRadius: 8, padding: 16, alignItems: 'center' },
  finishButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default AssignMedicineScreen; 