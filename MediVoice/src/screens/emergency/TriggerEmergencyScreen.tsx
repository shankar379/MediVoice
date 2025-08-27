import React, { useState } from 'react';
import { View, Text, Button, Modal, StyleSheet, ToastAndroid, ActivityIndicator } from 'react-native';
import { triggerEmergencyAlert } from '../../services/emergencyService';

const TriggerEmergencyScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [status, setStatus] = useState('Not triggered');
  const [loading, setLoading] = useState(false);

  const handleEmergency = async () => {
    setModalVisible(true);
    setStatus('Emergency triggered');
    setLoading(true);
    // Mock user info for demo
    const userInfo = {
      userId: 'uid_abc123',
      name: 'Demo Patient',
      phone: '9876543210',
      type: 'patient',
      location: null,
      isDemo: true,
    };
    try {
      await triggerEmergencyAlert(userInfo);
      ToastAndroid.show('Demo call to emergency contact for testing only', ToastAndroid.SHORT);
    } catch (e) {
      ToastAndroid.show('Failed to trigger emergency', ToastAndroid.SHORT);
    }
    setTimeout(() => {
      setModalVisible(false);
      setLoading(false);
    }, 3000);
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Emergency</Text>
      <Button title="Send Emergency Alert" onPress={handleEmergency} />
      <Text style={{ marginTop: 24 }}>Status: {status}</Text>
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🚨 Emergency Mode Activated</Text>
            <Text style={styles.modalSubtitle}>Calling Emergency Contact...</Text>
            {loading && <ActivityIndicator size="large" color="#e74c3c" style={{ marginTop: 20 }} />}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: 300,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#2c3e50',
  },
});

export default TriggerEmergencyScreen; 