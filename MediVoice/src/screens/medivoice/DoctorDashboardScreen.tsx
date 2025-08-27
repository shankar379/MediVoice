import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Button,
} from 'react-native';
import { useMediVoice } from '../../contexts/MediVoiceContext';
import { MediVoiceUser, MedicineAssignment } from '../../types';

const DoctorDashboardScreen = ({ navigation }: any) => {
  const { currentDoctor, allUsers, medicineAssignments } = useMediVoice();
  const [selectedPatient, setSelectedPatient] = useState<MediVoiceUser | null>(null);

  // Get patients assigned to this doctor
  const getPatients = (): MediVoiceUser[] => {
    if (!currentDoctor) return [];
    return allUsers.filter(user => currentDoctor.patients.includes(user.id));
  };

  // Get medicine assignments for a specific patient
  const getPatientMedicines = (patientId: string): MedicineAssignment[] => {
    return medicineAssignments.filter(assignment => 
      assignment.userId === patientId && assignment.assignedByType === 'doctor'
    );
  };

  const handleViewPatient = (patient: MediVoiceUser) => {
    setSelectedPatient(patient);
  };

  const PatientCard = ({ patient }: { patient: MediVoiceUser }) => {
    const patientMedicines = getPatientMedicines(patient.id);
    const activeMedicines = patientMedicines.filter(med => med.isActive);

    return (
      <TouchableOpacity
        style={styles.patientCard}
        onPress={() => handleViewPatient(patient)}
      >
        <View style={styles.patientHeader}>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientPhone}>{patient.mobileNumber}</Text>
        </View>
        
        <View style={styles.patientInfo}>
          <Text style={styles.patientInfoText}>
            <Text style={styles.label}>Gender:</Text> {patient.gender}
          </Text>
          {patient.bloodGroup && (
            <Text style={styles.patientInfoText}>
              <Text style={styles.label}>Blood Group:</Text> {patient.bloodGroup}
            </Text>
          )}
          <Text style={styles.patientInfoText}>
            <Text style={styles.label}>Active Medicines:</Text> {activeMedicines.length}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const PatientDetailModal = () => {
    if (!selectedPatient) return null;

    const patientMedicines = getPatientMedicines(selectedPatient.id);

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Patient Details</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPatient(null)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            <View style={styles.patientDetailSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <Text style={styles.detailText}>Name: {selectedPatient.name}</Text>
              <Text style={styles.detailText}>Mobile: {selectedPatient.mobileNumber}</Text>
              <Text style={styles.detailText}>Gender: {selectedPatient.gender}</Text>
              {selectedPatient.bloodGroup && (
                <Text style={styles.detailText}>Blood Group: {selectedPatient.bloodGroup}</Text>
              )}
              {selectedPatient.allergies.length > 0 && (
                <Text style={styles.detailText}>
                  Allergies: {selectedPatient.allergies.join(', ')}
                </Text>
              )}
              <Text style={styles.detailText}>
                Preferred Language: {selectedPatient.preferredLanguage}
              </Text>
            </View>

            <View style={styles.patientDetailSection}>
              <Text style={styles.sectionTitle}>Medicine History</Text>
              {patientMedicines.length === 0 ? (
                <Text style={styles.noDataText}>No medicines assigned yet</Text>
              ) : (
                patientMedicines.map(medicine => (
                  <View key={medicine.id} style={styles.medicineCard}>
                    <Text style={styles.medicineName}>{medicine.medicineName}</Text>
                    <Text style={styles.medicineDetails}>
                      Dosage: {medicine.dosage} | Frequency: {medicine.frequency}
                    </Text>
                    <Text style={styles.medicineDetails}>
                      Duration: {new Date(medicine.startDate).toLocaleDateString()} - 
                      {medicine.endDate ? new Date(medicine.endDate).toLocaleDateString() : 'Ongoing'}
                    </Text>
                    {medicine.instructions && (
                      <Text style={styles.medicineInstructions}>
                        Instructions: {medicine.instructions}
                      </Text>
                    )}
                    <View style={styles.medicineStatus}>
                      <Text style={[
                        styles.statusBadge,
                        medicine.isActive ? styles.activeBadge : styles.inactiveBadge
                      ]}>
                        {medicine.isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  const patients = getPatients();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Dr. {currentDoctor?.name} 👨‍⚕️
          </Text>
          <Text style={styles.subtitle}>
            {currentDoctor?.specialization} • {currentDoctor?.experience} years experience
          </Text>
        </View>

        {/* Doctor Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{patients.length}</Text>
              <Text style={styles.statLabel}>Total Patients</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {medicineAssignments.filter(med => med.assignedByType === 'doctor').length}
              </Text>
              <Text style={styles.statLabel}>Prescriptions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {medicineAssignments.filter(med => 
                  med.assignedByType === 'doctor' && med.isActive
                ).length}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
        </View>

        {/* Patients List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Patients ({patients.length})</Text>
          {patients.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No patients assigned yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Patients will appear here once they are assigned to you.
              </Text>
            </View>
          ) : (
            patients.map(patient => (
              <PatientCard key={patient.id} patient={patient} />
            ))
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>
              Last login: {new Date().toLocaleDateString()}
            </Text>
            <Text style={styles.activityText}>
              License: {currentDoctor?.licenseNumber}
            </Text>
            <Text style={styles.activityText}>
              Verification: {currentDoctor?.isVerified ? '✅ Verified' : '⏳ Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Assign Prescription to Patient" onPress={() => navigation.navigate('AssignMedicine')} />
          <Button title="View Patient History" onPress={() => {}} />
        </View>
      </ScrollView>

      {selectedPatient && <PatientDetailModal />}
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  patientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientHeader: {
    marginBottom: 12,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  patientPhone: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  patientInfo: {
    marginBottom: 12,
  },
  patientInfoText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 2,
  },
  label: {
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 4,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#7f8c8d',
  },
  modalScroll: {
    padding: 20,
  },
  patientDetailSection: {
    marginBottom: 24,
  },
  detailText: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 8,
  },
  medicineCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  medicineDetails: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  medicineInstructions: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  medicineStatus: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  inactiveBadge: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  noDataText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default DoctorDashboardScreen; 