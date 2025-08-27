import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  RefreshControl,
  Button,
} from 'react-native';
import { useMediVoice } from '../../contexts/MediVoiceContext';
import voiceService from '../../services/voiceService';
import { MedicineAssignment, MedicineReminder } from '../../types';

const PatientDashboardScreen = ({ navigation }: any) => {
  const { currentUser, medicineAssignments, medicineReminders, updateMedicineStatus, refreshMedicineAssignments } = useMediVoice();
  const [refreshing, setRefreshing] = useState(false);
  const [todayReminders, setTodayReminders] = useState<MedicineReminder[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakingReminderId = useRef<string | null>(null);

  useEffect(() => {
    loadTodayReminders();
  }, [medicineReminders]);

  useEffect(() => {
    // Refresh medicine assignments when component mounts
    refreshMedicineAssignments();
  }, []);

  useEffect(() => {
    // Debug: Log medicine assignments for current user
    if (currentUser) {
      const userAssignments = medicineAssignments.filter(assignment => assignment.userId === currentUser.mobileNumber);
      console.log('Current user assignments:', userAssignments.length);
      console.log('All assignments:', medicineAssignments.length);
      console.log('User assignments:', userAssignments.map(a => ({ id: a.id, name: a.medicineName, userId: a.userId })));
    }
  }, [medicineAssignments, currentUser]);

  const loadTodayReminders = () => {
    const today = new Date().toDateString();
    const todayRemindersList = medicineReminders.filter(reminder => {
      const reminderDate = new Date(reminder.scheduledTime).toDateString();
      return reminderDate === today && reminder.status === 'scheduled';
    });
    setTodayReminders(todayRemindersList);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshMedicineAssignments();
    loadTodayReminders();
    setRefreshing(false);
  };

  const handleVoiceReminder = async (assignment: MedicineAssignment, reminderId?: string) => {
    if (!currentUser) return;
    try {
      const message = voiceService.generateReminderMessage(
        assignment,
        currentUser.name,
        currentUser.voiceSettings
      );
      setIsSpeaking(true);
      speakingReminderId.current = reminderId || null;
      await voiceService.speakReminder(message, currentUser.voiceSettings, () => {
        setIsSpeaking(false);
        speakingReminderId.current = null;
      });
    } catch (error) {
      setIsSpeaking(false);
      speakingReminderId.current = null;
      Alert.alert('Error', 'Failed to play voice reminder');
    }
  };

  const handleStopAlarm = async () => {
    await voiceService.stopSpeaking();
    setIsSpeaking(false);
    speakingReminderId.current = null;
  };

  const handleMedicineAction = async (reminderId: string, action: 'taken' | 'snoozed') => {
    try {
      await updateMedicineStatus(reminderId, action);
      Alert.alert('Success', `Medicine marked as ${action}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update medicine status');
    }
  };

  const getAssignmentById = (assignmentId: string): MedicineAssignment | undefined => {
    return medicineAssignments.find(assignment => assignment.id === assignmentId);
  };

  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const ReminderCard = ({ reminder }: { reminder: MedicineReminder }) => {
    const assignment = getAssignmentById(reminder.assignmentId);
    if (!assignment) return null;
    return (
      <View style={styles.reminderCard}>
        <View style={styles.reminderHeader}>
          <Text style={styles.medicineName}>{assignment.medicineName}</Text>
          <Text style={styles.reminderTime}>{formatTime(reminder.scheduledTime)}</Text>
        </View>
        <View style={styles.visualRow}>
          {assignment.color && (
            <View style={[styles.colorCircle, { backgroundColor: assignment.color.toLowerCase() }]} />
          )}
          {assignment.shape && (
            <Text style={styles.shapeText}>{assignment.shape}</Text>
          )}
        </View>
        <Text style={styles.dosageText}>Dosage: {assignment.dosage}</Text>
        {assignment.instructions && (
          <Text style={styles.instructionsText}>Instructions: {assignment.instructions}</Text>
        )}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={() => handleVoiceReminder(assignment, reminder.id)}
            disabled={isSpeaking}
          >
            <Text style={styles.voiceButtonText}>🔊 Voice Reminder</Text>
          </TouchableOpacity>
          {isSpeaking && speakingReminderId.current === reminder.id && (
            <TouchableOpacity style={styles.stopButton} onPress={handleStopAlarm}>
              <Text style={styles.stopButtonText}>⏹ Stop Alarm</Text>
            </TouchableOpacity>
          )}
          <View style={styles.statusButtons}>
            <TouchableOpacity
              style={[styles.statusButton, styles.takenButton]}
              onPress={() => handleMedicineAction(reminder.id, 'taken')}
            >
              <Text style={styles.statusButtonText}>✓ Taken</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusButton, styles.snoozeButton]}
              onPress={() => handleMedicineAction(reminder.id, 'snoozed')}
            >
              <Text style={styles.statusButtonText}>⏰ Snooze</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const AssignmentCard = ({ assignment }: { assignment: MedicineAssignment }) => {
    const isActive = assignment.isActive && new Date(assignment.startDate) <= new Date();
    const isEnded = assignment.endDate && new Date(assignment.endDate) < new Date();

    return (
      <View style={[styles.assignmentCard, !isActive && styles.inactiveCard]}>
        <View style={styles.assignmentHeader}>
          <Text style={styles.assignmentTitle}>{assignment.medicineName}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {isEnded ? 'Ended' : isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        <View style={styles.visualRow}>
          {assignment.color && (
            <View style={[styles.colorCircle, { backgroundColor: assignment.color.toLowerCase() }]} />
          )}
          {assignment.shape && (
            <Text style={styles.shapeText}>{assignment.shape}</Text>
          )}
        </View>
        <Text style={styles.dosageText}>Dosage: {assignment.dosage}</Text>
        {assignment.timings && assignment.timings.length > 0 && (
          <Text style={styles.timesText}>
            Timings: {assignment.timings.join(', ')}
          </Text>
        )}
        {assignment.instructions && (
          <Text style={styles.instructionsText}>Instructions: {assignment.instructions}</Text>
        )}
        <Text style={styles.dateText}>
          {new Date(assignment.startDate).toLocaleDateString()} - 
          {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : 'Ongoing'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome back, {currentUser?.name || 'Patient'}! 👋
          </Text>
          <Text style={styles.subtitle}>Your medicine reminders for today</Text>
        </View>

        {/* Today's Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Reminders ({todayReminders.length})</Text>
          {todayReminders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>🎉 No reminders for today!</Text>
              <Text style={styles.emptyStateSubtext}>You're all caught up with your medicines.</Text>
            </View>
          ) : (
            todayReminders.map(reminder => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))
          )}
        </View>

        {/* All Assignments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Medicine Assignments</Text>
          {medicineAssignments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No medicines assigned yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Contact your medical store or doctor to get started.
              </Text>
            </View>
          ) : (
            medicineAssignments.map(assignment => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))
          )}
        </View>

        <View style={styles.buttonSection}>
          <Button title="View Medicine Reminders" onPress={() => navigation.navigate('MedicineReminders')} />
          <Button title="Ask AI About Medicines" onPress={() => navigation.navigate('MedicineChat')} />
          <Button title="Wallet & Watch Ads" onPress={() => navigation.navigate('CoinWallet')} />
          <Button title="Emergency" color="red" onPress={() => navigation.navigate('TriggerEmergency')} />
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
  reminderCard: {
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
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  reminderTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3498db',
  },
  dosageText: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  actionButtons: {
    marginTop: 12,
  },
  voiceButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  voiceButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  takenButton: {
    backgroundColor: '#27ae60',
  },
  snoozeButton: {
    backgroundColor: '#f39c12',
  },
  statusButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  assignmentCard: {
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
  inactiveCard: {
    opacity: 0.6,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusBadge: {
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6c757d',
  },
  timesText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 8,
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
  buttonSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  visualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  shapeText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PatientDashboardScreen; 