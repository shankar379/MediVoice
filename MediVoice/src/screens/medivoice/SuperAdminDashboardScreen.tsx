import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useSuperAdmin } from '../../contexts/SuperAdminContext';
import { useRole } from '../../contexts/RoleContext';
import { ref, get, push, set } from 'firebase/database';
import { rtdb } from '../../config/firebase';
import { fetchPatientFromFirebase } from '../../services/patientService';
import { createStackNavigator } from '@react-navigation/stack';
import TriggerEmergencyScreen from '../../screens/TriggerEmergencyScreen';

const Stack = createStackNavigator();

const SuperAdminDashboardScreen: React.FC = ({ navigation }: any) => {
  const { 
    currentAdmin, 
    allDoctors, 
    allSellers, 
    allPatients, 
    adminActions,
    loading,
    loadAllUsers, 
    loadAdminActions,
    verifyDoctor,
    verifySeller,
    blockUser,
    unblockUser,
    deleteUser,
    logoutSuperAdmin
  } = useSuperAdmin();
  const { setRole } = useRole();
  const [refreshing, setRefreshing] = useState(false);
  const [searchMobile, setSearchMobile] = useState('');
  const [foundPatient, setFoundPatient] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        loadAllUsers(),
        loadAdminActions()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load admin data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logoutSuperAdmin();
            setRole(null);
            navigation.navigate('MediVoiceLogin');
          }
        }
      ]
    );
  };

  const handleVerifyDoctor = async (doctorId: string) => {
    try {
      await verifyDoctor(doctorId);
      Alert.alert('Success', 'Doctor verified successfully');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to verify doctor');
    }
  };

  const handleVerifySeller = async (sellerId: string) => {
    try {
      await verifySeller(sellerId);
      Alert.alert('Success', 'Seller verified successfully');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to verify seller');
    }
  };

  const handleBlockUser = async (userId: string, userType: 'doctor' | 'seller' | 'patient') => {
    try {
      await blockUser(userId, userType);
      Alert.alert('Success', `${userType} blocked successfully`);
      loadData();
    } catch (error) {
      Alert.alert('Error', `Failed to block ${userType}`);
    }
  };

  const handleUnblockUser = async (userId: string, userType: 'doctor' | 'seller' | 'patient') => {
    try {
      await unblockUser(userId, userType);
      Alert.alert('Success', `${userType} unblocked successfully`);
      loadData();
    } catch (error) {
      Alert.alert('Error', `Failed to unblock ${userType}`);
    }
  };

  const handleDeleteUser = async (userId: string, userType: 'doctor' | 'seller' | 'patient') => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete this ${userType}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(userId, userType);
              Alert.alert('Success', `${userType} deleted successfully`);
              loadData();
            } catch (error) {
              Alert.alert('Error', `Failed to delete ${userType}`);
            }
          }
        }
      ]
    );
  };

  const handleSearchUser = async () => {
    if (!searchMobile.trim()) {
      Alert.alert('Error', 'Please enter a mobile number');
      return;
    }

    const patient = await fetchPatientFromFirebase(searchMobile.trim());
    if (patient) {
      setFoundPatient(patient);
    } else {
      Alert.alert('User Not Found', 'No patient found with this mobile number');
    }
  };

  const StatCard = ({ title, value, color }: { title: string; value: number; color: string }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const UserCard = ({ 
    user, 
    userType, 
    onVerify, 
    onBlock, 
    onUnblock, 
    onDelete 
  }: { 
    user: any; 
    userType: 'doctor' | 'seller' | 'patient';
    onVerify?: () => void;
    onBlock: () => void;
    onUnblock: () => void;
    onDelete: () => void;
  }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userPhone}>{user.mobileNumber}</Text>
        {user.email && <Text style={styles.userEmail}>{user.email}</Text>}
        {userType === 'doctor' && user.specialization && (
          <Text style={styles.userDetail}>Specialization: {user.specialization}</Text>
        )}
        {userType === 'seller' && user.storeName && (
          <Text style={styles.userDetail}>Store: {user.storeName}</Text>
        )}
        <View style={styles.verificationStatus}>
          <Text style={[
            styles.statusText, 
            { color: user.isVerified ? '#27ae60' : '#e74c3c' }
          ]}>
            {user.isVerified ? '✓ Verified' : '✗ Not Verified'}
          </Text>
        </View>
      </View>
      
      <View style={styles.userActions}>
        {onVerify && !user.isVerified && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.verifyButton]} 
            onPress={onVerify}
          >
            <Text style={styles.actionButtonText}>Verify</Text>
          </TouchableOpacity>
        )}
        
        {user.isBlocked ? (
          <TouchableOpacity 
            style={[styles.actionButton, styles.unblockButton]} 
            onPress={onUnblock}
          >
            <Text style={styles.actionButtonText}>Unblock</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.actionButton, styles.blockButton]} 
            onPress={onBlock}
          >
            <Text style={styles.actionButtonText}>Block</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={onDelete}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const assignMedicineToPatient = async (mobileNumber: string, assignment: any) => {
    const assignmentsRef = ref(rtdb, `users/patients/${mobileNumber}/medicineAssignments`);
    const newAssignmentRef = push(assignmentsRef);
    await set(newAssignmentRef, assignment);
  };

  if (!currentAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Access Denied</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Super Admin Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard title="Doctors" value={allDoctors.length} color="#e74c3c" />
            <StatCard title="Sellers" value={allSellers.length} color="#27ae60" />
            <StatCard title="Patients" value={allPatients.length} color="#3498db" />
            <StatCard title="Actions" value={adminActions.length} color="#9b59b6" />
          </View>
        </View>

        {/* Doctors Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doctors ({allDoctors.length})</Text>
          {allDoctors.map((doctor) => (
            <UserCard
              key={doctor.id}
              user={doctor}
              userType="doctor"
              onVerify={() => handleVerifyDoctor(doctor.id)}
              onBlock={() => handleBlockUser(doctor.id, 'doctor')}
              onUnblock={() => handleUnblockUser(doctor.id, 'doctor')}
              onDelete={() => handleDeleteUser(doctor.id, 'doctor')}
            />
          ))}
          {allDoctors.length === 0 && (
            <Text style={styles.emptyText}>No doctors found</Text>
          )}
        </View>

        {/* Sellers Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sellers ({allSellers.length})</Text>
          {allSellers.map((seller) => (
            <UserCard
              key={seller.id}
              user={seller}
              userType="seller"
              onVerify={() => handleVerifySeller(seller.id)}
              onBlock={() => handleBlockUser(seller.id, 'seller')}
              onUnblock={() => handleUnblockUser(seller.id, 'seller')}
              onDelete={() => handleDeleteUser(seller.id, 'seller')}
            />
          ))}
          {allSellers.length === 0 && (
            <Text style={styles.emptyText}>No sellers found</Text>
          )}
        </View>

        {/* Patients Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patients ({allPatients.length})</Text>
          {allPatients.map((patient) => (
            <UserCard
              key={patient.id}
              user={patient}
              userType="patient"
              onBlock={() => handleBlockUser(patient.id, 'patient')}
              onUnblock={() => handleUnblockUser(patient.id, 'patient')}
              onDelete={() => handleDeleteUser(patient.id, 'patient')}
            />
          ))}
          {allPatients.length === 0 && (
            <Text style={styles.emptyText}>No patients found</Text>
          )}
        </View>

        {/* Recent Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Admin Actions</Text>
          {adminActions.slice(0, 10).map((action, index) => (
            <View key={index} style={styles.actionCard}>
              <Text style={styles.actionText}>{action.action}</Text>
              <Text style={styles.actionTime}>
                {new Date(action.timestamp).toLocaleString()}
              </Text>
            </View>
          ))}
          {adminActions.length === 0 && (
            <Text style={styles.emptyText}>No recent actions</Text>
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2c3e50',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  statsSection: {
    padding: 20,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statTitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  userPhone: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  userDetail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  verificationStatus: {
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  verifyButton: {
    backgroundColor: '#27ae60',
  },
  blockButton: {
    backgroundColor: '#f39c12',
  },
  unblockButton: {
    backgroundColor: '#3498db',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  actionTime: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginTop: 20,
  },
});

export default SuperAdminDashboardScreen; 