import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { t } from '../../i18n';

const PrescriptionScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
          <Text style={styles.title}>E-Prescription</Text>
        <Text style={styles.subtitle}>Digital prescription management</Text>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
});

export default PrescriptionScreen; 