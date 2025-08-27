import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { Appointment, Notification } from '../../types';
import LanguageSelector from '../../components/LanguageSelector';
import { t } from '../../i18n';

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load appointments
      const appointmentsData = await AsyncStorage.getItem('appointments');
      if (appointmentsData) {
        const appointments = JSON.parse(appointmentsData);
        const upcoming = appointments
          .filter((apt: Appointment) => apt.status === 'confirmed' || apt.status === 'pending')
          .slice(0, 3);
        setUpcomingAppointments(upcoming);
      }

      // Load notifications
      const notificationsData = await AsyncStorage.getItem('notifications');
      if (notificationsData) {
        const allNotifications = JSON.parse(notificationsData);
        const unread = allNotifications
          .filter((notif: Notification) => !notif.isRead)
          .slice(0, 5);
        setNotifications(unread);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: t('book_appointment'),
      icon: '📅',
      color: '#3498db',
      onPress: () => navigation.navigate('BookAppointment'),
    },
    {
      title: t('video'),
      icon: '📹',
      color: '#27ae60',
      onPress: () => navigation.navigate('VideoConsult'),
    },
    {
      title: 'AI Symptom Checker',
      icon: '🤖',
      color: '#9b59b6',
      onPress: () => navigation.navigate('SymptomChecker'),
    },
    {
      title: t('emergency'),
      icon: '🚨',
      color: '#e74c3c',
      onPress: () => navigation.navigate('Emergency'),
    },
    {
      title: 'Pharmacy',
      icon: '💊',
      color: '#f39c12',
      onPress: () => navigation.navigate('Pharmacy'),
    },
    {
      title: 'Lab Tests',
      icon: '🔬',
      color: '#1abc9c',
      onPress: () => navigation.navigate('LabTests'),
    },
  ];

  const healthTips = [
    {
      title: 'Stay Hydrated',
      description: 'Drink at least 8 glasses of water daily',
      icon: '💧',
    },
    {
      title: 'Exercise Regularly',
      description: '30 minutes of moderate exercise daily',
      icon: '🏃‍♂️',
    },
    {
      title: 'Get Enough Sleep',
      description: '7-9 hours of quality sleep per night',
      icon: '😴',
    },
  ];

  const renderQuickAction = (action: any) => (
    <TouchableOpacity
      key={action.title}
      style={[styles.quickActionCard, { backgroundColor: action.color }]}
      onPress={action.onPress}
    >
      <Text style={styles.quickActionIcon}>{action.icon}</Text>
      <Text style={styles.quickActionTitle}>{action.title}</Text>
    </TouchableOpacity>
  );

  const renderAppointmentCard = (appointment: Appointment) => (
    <View key={appointment.id} style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.appointmentDoctor}>{appointment.doctorName}</Text>
        <Text style={[
          styles.appointmentStatus,
          appointment.status === 'confirmed' && styles.statusConfirmed,
          appointment.status === 'pending' && styles.statusPending
        ]}>
          {t(appointment.status)}
        </Text>
      </View>
      <Text style={styles.appointmentDate}>
        {appointment.date} at {appointment.time}
      </Text>
      <Text style={styles.appointmentType}>
        {appointment.type === 'video' ? '📹 Video Consultation' : '🏥 In-person'}
      </Text>
    </View>
  );

  const renderNotificationCard = (notification: Notification) => (
    <View key={notification.id} style={styles.notificationCard}>
      <Text style={styles.notificationTitle}>{notification.title}</Text>
      <Text style={styles.notificationMessage}>{notification.message}</Text>
      <Text style={styles.notificationTime}>
        {new Date(notification.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  const renderHealthTip = (tip: any) => (
    <View key={tip.title} style={styles.healthTipCard}>
      <Text style={styles.healthTipIcon}>{tip.icon}</Text>
      <View style={styles.healthTipContent}>
        <Text style={styles.healthTipTitle}>{tip.title}</Text>
        <Text style={styles.healthTipDescription}>{tip.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LanguageSelector />
      <ScrollView style={styles.scrollView}>
        {/* Welcome Header */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>{t('welcome')} back,</Text>
            <Text style={styles.userName}>{userProfile?.name || 'User'}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => Alert.alert('Notifications', 'View all notifications')}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            {notifications.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>{notifications.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quick_actions')}</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('appointments')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {upcomingAppointments.map(renderAppointmentCard)}
          </View>
        )}

        {/* Notifications */}
        {notifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            {notifications.map(renderNotificationCard)}
          </View>
        )}

        {/* Health Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Tips</Text>
          {healthTips.map(renderHealthTip)}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  notificationButton: {
    position: 'relative',
    padding: 10,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  viewAllText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  appointmentCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentDoctor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  appointmentStatus: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusConfirmed: {
    backgroundColor: '#d5f4e6',
    color: '#27ae60',
  },
  statusPending: {
    backgroundColor: '#fef9e7',
    color: '#f39c12',
  },
  appointmentDate: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  appointmentType: {
    fontSize: 12,
    color: '#3498db',
  },
  healthTipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  healthTipIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  healthTipContent: {
    flex: 1,
  },
  healthTipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  healthTipDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  notificationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#95a5a6',
  },
  emergencySection: {
    margin: 20,
    backgroundColor: '#e74c3c',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  emergencyButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  emergencyButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 