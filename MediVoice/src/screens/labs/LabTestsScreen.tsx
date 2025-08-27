import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { Lab, LabTest, LabBooking } from '../../types';
import { t } from '../../i18n';

const LabTestsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock labs data
  const [labs] = useState<Lab[]>([
    {
      id: '1',
      name: 'Metro Lab & Diagnostics',
      address: '123 Health Street, City Center',
      phone: '+91 98765 43210',
      email: 'metro@example.com',
      rating: 4.6,
      isOpen: true,
      location: { latitude: 0, longitude: 0 },
      tests: [
        { id: '1', name: 'Complete Blood Count (CBC)', description: 'Blood cell count and analysis', price: 800, preparation: 'Fasting required for 8-12 hours', duration: 'Same day' },
        { id: '2', name: 'Blood Sugar (FBS)', description: 'Fasting blood sugar test', price: 300, preparation: 'Fasting required for 8-12 hours', duration: 'Same day' },
        { id: '3', name: 'Lipid Profile', description: 'Cholesterol and triglyceride levels', price: 600, preparation: 'Fasting required for 12-14 hours', duration: 'Same day' },
      ],
    },
    {
      id: '2',
      name: 'HealthCare Diagnostics',
      address: '456 Medical Avenue, Downtown',
      phone: '+91 98765 43211',
      email: 'healthcare@example.com',
      rating: 4.4,
      isOpen: true,
      location: { latitude: 0, longitude: 0 },
      tests: [
        { id: '4', name: 'Liver Function Test (LFT)', description: 'Liver enzyme and protein levels', price: 900, preparation: 'Fasting required for 8-12 hours', duration: 'Next day' },
        { id: '5', name: 'Kidney Function Test (KFT)', description: 'Kidney function and electrolyte levels', price: 700, preparation: 'Fasting required for 8-12 hours', duration: 'Same day' },
        { id: '6', name: 'Thyroid Profile (T3, T4, TSH)', description: 'Thyroid hormone levels', price: 1200, preparation: 'No special preparation required', duration: 'Next day' },
      ],
    },
  ]);

  const categories = ['All', 'Blood Tests', 'Urine Tests', 'Imaging', 'Cardiac', 'Diabetes', 'Hormonal'];

  const allTests = labs.flatMap(lab => lab.tests);

  const filteredTests = allTests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const toggleTestSelection = (test: LabTest) => {
    if (selectedTests.find(t => t.id === test.id)) {
      setSelectedTests(prev => prev.filter(t => t.id !== test.id));
    } else {
      setSelectedTests(prev => [...prev, test]);
    }
  };

  const getTotalAmount = () => {
    return selectedTests.reduce((total, test) => total + test.price, 0);
  };

  const bookTests = async () => {
    if (selectedTests.length === 0) {
      Alert.alert('Error', 'Please select at least one test');
      return;
    }

    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select date and time');
      return;
    }

    setLoading(true);
    try {
      const booking: LabBooking = {
        id: Date.now().toString(),
        patientId: userProfile?.id || '',
        labId: labs[0].id, // Default to first lab
        tests: selectedTests,
        date: selectedDate,
        time: selectedTime,
        status: 'pending',
        totalAmount: getTotalAmount(),
        createdAt: new Date(),
      };

      // Save booking to storage
      const existingBookings = await getStoredBookings();
      existingBookings.push(booking);
      await AsyncStorage.setItem('labBookings', JSON.stringify(existingBookings));

      Alert.alert(
        'Booking Successful',
        `Your lab tests have been booked for ${selectedDate} at ${selectedTime}`,
        [
          { text: 'OK', onPress: () => {
            setSelectedTests([]);
            setSelectedDate('');
            setSelectedTime('');
            navigation.navigate('LabBookings');
          }}
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to book tests');
    } finally {
      setLoading(false);
    }
  };

  const getStoredBookings = async (): Promise<LabBooking[]> => {
    try {
      const bookings = await AsyncStorage.getItem('labBookings');
      return bookings ? JSON.parse(bookings) : [];
    } catch (error) {
      return [];
    }
  };

  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  const renderTestItem = ({ item }: { item: LabTest }) => {
    const isSelected = selectedTests.find(t => t.id === item.id);
    return (
      <TouchableOpacity
        style={[styles.testCard, isSelected && styles.testCardSelected]}
        onPress={() => toggleTestSelection(item)}
      >
        <View style={styles.testHeader}>
          <View style={styles.testInfo}>
            <Text style={styles.testName}>{item.name}</Text>
            <Text style={styles.testDescription}>{item.description}</Text>
            {item.preparation && (
              <Text style={styles.testPreparation}>📋 {item.preparation}</Text>
            )}
          </View>
          <View style={styles.testPrice}>
            <Text style={styles.priceText}>₹{item.price}</Text>
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedText}>✓ Selected</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderLabCard = ({ item }: { item: Lab }) => (
    <View style={styles.labCard}>
      <View style={styles.labHeader}>
        <Text style={styles.labName}>{item.name}</Text>
        <Text style={styles.labRating}>⭐ {item.rating}</Text>
      </View>
      <Text style={styles.labAddress}>{item.address}</Text>
      <View style={styles.labStatus}>
        <Text style={[styles.statusText, item.isOpen && styles.statusOpen]}>
          {item.isOpen ? 'Open' : 'Closed'}
        </Text>
        <Text style={styles.testCount}>{item.tests.length} tests available</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Lab Tests</Text>
          <Text style={styles.subtitle}>Book laboratory tests</Text>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tests..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Selected Tests Summary */}
        {selectedTests.length > 0 && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>
              Selected Tests ({selectedTests.length})
            </Text>
            <Text style={styles.summaryTotal}>
              Total Amount: ₹{getTotalAmount()}
            </Text>
            
            <View style={styles.selectedTestsList}>
              {selectedTests.map((test) => (
                <View key={test.id} style={styles.selectedTestItem}>
                  <Text style={styles.selectedTestName}>{test.name}</Text>
                  <Text style={styles.selectedTestPrice}>₹{test.price}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Booking Details */}
        {selectedTests.length > 0 && (
          <View style={styles.bookingSection}>
            <Text style={styles.sectionTitle}>Booking Details</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Preferred Date</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                value={selectedDate}
                onChangeText={setSelectedDate}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Preferred Time</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.timeSlotContainer}>
                  {timeSlots.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeSlot,
                        selectedTime === time && styles.timeSlotActive
                      ]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        selectedTime === time && styles.timeSlotTextActive
                      ]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <TouchableOpacity
              style={[styles.bookButton, loading && styles.bookButtonDisabled]}
              onPress={bookTests}
              disabled={loading}
            >
              <Text style={styles.bookButtonText}>
                {loading ? 'Booking...' : 'Book Tests'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Available Tests */}
        <View style={styles.testsSection}>
          <Text style={styles.sectionTitle}>Available Tests</Text>
          <FlatList
            data={filteredTests}
            renderItem={renderTestItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Partner Labs */}
        <View style={styles.labsSection}>
          <Text style={styles.sectionTitle}>Partner Labs</Text>
          <FlatList
            data={labs}
            renderItem={renderLabCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('LabBookings')}
            >
              <Text style={styles.actionButtonIcon}>📋</Text>
              <Text style={styles.actionButtonText}>My Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('LabReports')}
            >
              <Text style={styles.actionButtonIcon}>📊</Text>
              <Text style={styles.actionButtonText}>Reports</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
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
  searchSection: {
    padding: 20,
    backgroundColor: 'white',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  summarySection: {
    padding: 20,
    backgroundColor: '#e8f5e8',
    marginTop: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
    marginBottom: 15,
  },
  selectedTestsList: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
  },
  selectedTestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  selectedTestName: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  selectedTestPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27ae60',
  },
  bookingSection: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f2f6',
    marginRight: 10,
    marginBottom: 10,
  },
  timeSlotActive: {
    backgroundColor: '#3498db',
  },
  timeSlotText: {
    color: '#7f8c8d',
    fontSize: 14,
    fontWeight: '500',
  },
  timeSlotTextActive: {
    color: 'white',
  },
  bookButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  testsSection: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  testCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  testCardSelected: {
    backgroundColor: '#e8f5e8',
    borderWidth: 2,
    borderColor: '#27ae60',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  testPreparation: {
    fontSize: 12,
    color: '#e74c3c',
    fontStyle: 'italic',
  },
  testPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  durationText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  selectedIndicator: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#27ae60',
  },
  selectedText: {
    color: '#27ae60',
    fontSize: 14,
    fontWeight: '600',
  },
  labsSection: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  labCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  labHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  labRating: {
    fontSize: 14,
    color: '#f39c12',
    fontWeight: '600',
  },
  labAddress: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  labStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e74c3c',
  },
  statusOpen: {
    color: '#27ae60',
  },
  testCount: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  actionsSection: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    minWidth: 100,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
});

export default LabTestsScreen; 