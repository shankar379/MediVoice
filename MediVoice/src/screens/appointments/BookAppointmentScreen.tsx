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
import { Doctor, Appointment } from '../../types';
import { t } from '../../i18n';

const BookAppointmentScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock doctors data
  const [doctors] = useState<Doctor[]>([
    {
      id: '1',
      email: 'dr.sarah@example.com',
      name: 'Dr. Sarah Johnson',
      phone: '+91 98765 43210',
      specialization: 'Cardiologist',
      experience: 15,
      licenseNumber: 'MCI12345',
      rating: 4.8,
      totalReviews: 127,
      consultationFee: 1500,
      isVerified: true,
      isAvailable: true,
      education: ['MBBS', 'MD Cardiology'],
      languages: ['English', 'Hindi'],
      about: 'Experienced cardiologist with expertise in interventional cardiology.',
      availableSlots: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      email: 'dr.michael@example.com',
      name: 'Dr. Michael Chen',
      phone: '+91 98765 43211',
      specialization: 'Dermatologist',
      experience: 12,
      licenseNumber: 'MCI12346',
      rating: 4.6,
      totalReviews: 89,
      consultationFee: 1200,
      isVerified: true,
      isAvailable: true,
      education: ['MBBS', 'MD Dermatology'],
      languages: ['English', 'Hindi', 'Mandarin'],
      about: 'Specialized in cosmetic dermatology and skin cancer treatment.',
      availableSlots: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      email: 'dr.priya@example.com',
      name: 'Dr. Priya Sharma',
      phone: '+91 98765 43212',
      specialization: 'Pediatrician',
      experience: 18,
      licenseNumber: 'MCI12347',
      rating: 4.9,
      totalReviews: 203,
      consultationFee: 1000,
      isVerified: true,
      isAvailable: true,
      education: ['MBBS', 'MD Pediatrics'],
      languages: ['English', 'Hindi', 'Gujarati'],
      about: 'Dedicated pediatrician with 18 years of experience in child healthcare.',
      availableSlots: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const specializations = ['All', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'Orthopedic', 'Psychiatrist'];

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialization = selectedSpecialization === 'All' || 
                                 doctor.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  const handleBookAppointment = async (doctor: Doctor) => {
    if (!selectedDate || !selectedTime || !symptoms) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const appointment: Appointment = {
        id: Date.now().toString(),
        patientId: userProfile?.id || '',
        doctorId: doctor.id,
        patientName: userProfile?.name || '',
        doctorName: doctor.name,
        date: selectedDate,
        time: selectedTime,
        type: 'in-person',
        status: 'pending',
        symptoms,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save appointment to storage
      const existingAppointments = await getStoredAppointments();
      existingAppointments.push(appointment);
      await AsyncStorage.setItem('appointments', JSON.stringify(existingAppointments));

      Alert.alert(
        'Success',
        `Appointment booked with ${doctor.name} on ${selectedDate} at ${selectedTime}`,
        [
          { text: 'OK', onPress: () => navigation.navigate('Appointments') }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const getStoredAppointments = async (): Promise<Appointment[]> => {
    try {
      const appointments = await AsyncStorage.getItem('appointments');
      return appointments ? JSON.parse(appointments) : [];
    } catch (error) {
      return [];
    }
  };

  const renderDoctorCard = ({ item }: { item: Doctor }) => (
    <View style={styles.doctorCard}>
      <View style={styles.doctorHeader}>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{item.name}</Text>
          <Text style={styles.doctorSpecialization}>{item.specialization}</Text>
          <Text style={styles.doctorExperience}>{item.experience} years experience</Text>
        </View>
        <View style={styles.doctorRating}>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          <Text style={styles.reviewsText}>({item.totalReviews} reviews)</Text>
        </View>
      </View>
      
      <Text style={styles.doctorAbout}>{item.about}</Text>
      
      <View style={styles.doctorDetails}>
        <Text style={styles.feeText}>Consultation Fee: ₹{item.consultationFee}</Text>
        <Text style={styles.languagesText}>Languages: {item.languages.join(', ')}</Text>
      </View>

      <TouchableOpacity
        style={[styles.bookButton, loading && styles.bookButtonDisabled]}
        onPress={() => handleBookAppointment(item)}
        disabled={loading}
      >
        <Text style={styles.bookButtonText}>
          {loading ? 'Booking...' : 'Book Appointment'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('book_new_appointment')}</Text>
          <Text style={styles.subtitle}>Schedule your medical appointment</Text>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors by name or specialization..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {specializations.map((spec) => (
              <TouchableOpacity
                key={spec}
                style={[
                  styles.filterChip,
                  selectedSpecialization === spec && styles.filterChipActive
                ]}
                onPress={() => setSelectedSpecialization(spec)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedSpecialization === spec && styles.filterChipTextActive
                ]}>
                  {spec}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Appointment Details */}
        <View style={styles.appointmentSection}>
          <Text style={styles.sectionTitle}>Appointment Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Preferred Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              value={selectedDate}
              onChangeText={setSelectedDate}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Preferred Time *</Text>
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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Symptoms/Reason *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your symptoms or reason for visit..."
              value={symptoms}
              onChangeText={setSymptoms}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Doctors List */}
        <View style={styles.doctorsSection}>
          <Text style={styles.sectionTitle}>Available Doctors</Text>
          <FlatList
            data={filteredDoctors}
            renderItem={renderDoctorCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
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
    marginBottom: 15,
  },
  filterContainer: {
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f2f6',
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#3498db',
  },
  filterChipText: {
    color: '#7f8c8d',
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: 'white',
  },
  appointmentSection: {
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
  doctorsSection: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  doctorCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
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
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: '#3498db',
    marginBottom: 2,
  },
  doctorExperience: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  doctorRating: {
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f39c12',
  },
  reviewsText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  doctorAbout: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 15,
  },
  doctorDetails: {
    marginBottom: 15,
  },
  feeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  languagesText: {
    fontSize: 12,
    color: '#7f8c8d',
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
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookAppointmentScreen; 