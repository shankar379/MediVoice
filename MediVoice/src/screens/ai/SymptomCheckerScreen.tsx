import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SymptomChecker } from '../../types';
import { t } from '../../i18n';

const SymptomCheckerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [analysis, setAnalysis] = useState<SymptomChecker | null>(null);
  const [loading, setLoading] = useState(false);

  const commonSymptoms = [
    'Fever', 'Headache', 'Cough', 'Chest Pain', 'Abdominal Pain',
    'Nausea', 'Vomiting', 'Diarrhea', 'Fatigue', 'Dizziness',
    'Shortness of Breath', 'Joint Pain', 'Back Pain', 'Rash',
    'Swelling', 'Numbness', 'Vision Problems', 'Hearing Loss',
    'Insomnia', 'Anxiety', 'Depression', 'Memory Loss'
  ];

  const symptomAnalysis = {
    'Fever': { department: 'General Medicine', confidence: 0.8, severity: 'medium' },
    'Headache': { department: 'Neurology', confidence: 0.7, severity: 'low' },
    'Cough': { department: 'Pulmonology', confidence: 0.8, severity: 'low' },
    'Chest Pain': { department: 'Cardiology', confidence: 0.9, severity: 'high' },
    'Abdominal Pain': { department: 'Gastroenterology', confidence: 0.8, severity: 'medium' },
    'Nausea': { department: 'Gastroenterology', confidence: 0.6, severity: 'low' },
    'Vomiting': { department: 'Gastroenterology', confidence: 0.7, severity: 'medium' },
    'Diarrhea': { department: 'Gastroenterology', confidence: 0.8, severity: 'medium' },
    'Fatigue': { department: 'General Medicine', confidence: 0.5, severity: 'low' },
    'Dizziness': { department: 'Neurology', confidence: 0.7, severity: 'medium' },
    'Shortness of Breath': { department: 'Pulmonology', confidence: 0.9, severity: 'high' },
    'Joint Pain': { department: 'Orthopedics', confidence: 0.8, severity: 'medium' },
    'Back Pain': { department: 'Orthopedics', confidence: 0.8, severity: 'medium' },
    'Rash': { department: 'Dermatology', confidence: 0.9, severity: 'low' },
    'Swelling': { department: 'General Medicine', confidence: 0.6, severity: 'medium' },
    'Numbness': { department: 'Neurology', confidence: 0.8, severity: 'medium' },
    'Vision Problems': { department: 'Ophthalmology', confidence: 0.9, severity: 'medium' },
    'Hearing Loss': { department: 'ENT', confidence: 0.8, severity: 'medium' },
    'Insomnia': { department: 'Psychiatry', confidence: 0.7, severity: 'low' },
    'Anxiety': { department: 'Psychiatry', confidence: 0.8, severity: 'medium' },
    'Depression': { department: 'Psychiatry', confidence: 0.8, severity: 'medium' },
    'Memory Loss': { department: 'Neurology', confidence: 0.8, severity: 'high' },
  };

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms(prev => [...prev, symptom]);
    }
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim()) {
      setSelectedSymptoms(prev => [...prev, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  const analyzeSymptoms = () => {
    if (selectedSymptoms.length === 0) {
      Alert.alert('Error', 'Please select at least one symptom');
      return;
    }

    setLoading(true);

    // Simulate AI analysis
    setTimeout(() => {
      const departmentScores: { [key: string]: number } = {};
      let totalConfidence = 0;
      let maxSeverity = 'low';

      selectedSymptoms.forEach(symptom => {
        const analysis = symptomAnalysis[symptom as keyof typeof symptomAnalysis];
        if (analysis) {
          departmentScores[analysis.department] = (departmentScores[analysis.department] || 0) + analysis.confidence;
          totalConfidence += analysis.confidence;
          
          if (analysis.severity === 'high') maxSeverity = 'high';
          else if (analysis.severity === 'medium' && maxSeverity !== 'high') maxSeverity = 'medium';
        }
      });

      const suggestedDepartment = Object.keys(departmentScores).reduce((a, b) => 
        departmentScores[a] > departmentScores[b] ? a : b
      );

      const confidence = totalConfidence / selectedSymptoms.length;

      const recommendations = [
        'Schedule an appointment with a specialist',
        'Monitor your symptoms closely',
        'Avoid self-medication',
        'Seek immediate care if symptoms worsen',
      ];

      if (maxSeverity === 'high') {
        recommendations.unshift('Consider visiting emergency care');
      }

      const result: SymptomChecker = {
        id: Date.now().toString(),
        symptoms: selectedSymptoms,
        suggestedDepartment,
        confidence,
        recommendations,
        severity: maxSeverity as 'low' | 'medium' | 'high',
        createdAt: new Date(),
      };

      setAnalysis(result);
      setLoading(false);
    }, 2000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#7f8c8d';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Unknown';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Symptom Checker</Text>
          <Text style={styles.subtitle}>Get preliminary health insights</Text>
        </View>

        {/* Symptom Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Your Symptoms</Text>
          
          <View style={styles.symptomsGrid}>
            {commonSymptoms.map((symptom) => (
              <TouchableOpacity
                key={symptom}
                style={[
                  styles.symptomChip,
                  selectedSymptoms.includes(symptom) && styles.symptomChipActive
                ]}
                onPress={() => toggleSymptom(symptom)}
              >
                <Text style={[
                  styles.symptomChipText,
                  selectedSymptoms.includes(symptom) && styles.symptomChipTextActive
                ]}>
                  {symptom}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Symptom */}
          <View style={styles.customSymptomContainer}>
            <Text style={styles.label}>Add Custom Symptom</Text>
            <View style={styles.customSymptomRow}>
              <TextInput
                style={styles.customSymptomInput}
                placeholder="Enter your symptom..."
                value={customSymptom}
                onChangeText={setCustomSymptom}
              />
              <TouchableOpacity style={styles.addButton} onPress={addCustomSymptom}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Selected Symptoms */}
          {selectedSymptoms.length > 0 && (
            <View style={styles.selectedSymptomsContainer}>
              <Text style={styles.label}>Selected Symptoms:</Text>
              <View style={styles.selectedSymptomsList}>
                {selectedSymptoms.map((symptom, index) => (
                  <View key={index} style={styles.selectedSymptomItem}>
                    <Text style={styles.selectedSymptomText}>{symptom}</Text>
                    <TouchableOpacity onPress={() => toggleSymptom(symptom)}>
                      <Text style={styles.removeSymptomButton}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.analyzeButton, loading && styles.analyzeButtonDisabled]}
            onPress={analyzeSymptoms}
            disabled={loading}
          >
            <Text style={styles.analyzeButtonText}>
              {loading ? 'Analyzing...' : 'Analyze Symptoms'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Analysis Results */}
        {analysis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analysis Results</Text>
            
            <View style={styles.analysisCard}>
              <View style={styles.analysisHeader}>
                <Text style={styles.departmentText}>{analysis.suggestedDepartment}</Text>
                <View style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(analysis.severity) }
                ]}>
                  <Text style={styles.severityText}>
                    {getSeverityText(analysis.severity)}
                  </Text>
                </View>
              </View>

              <Text style={styles.confidenceText}>
                Confidence: {(analysis.confidence * 100).toFixed(0)}%
              </Text>

              <Text style={styles.symptomsList}>
                Symptoms: {analysis.symptoms.join(', ')}
              </Text>

              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>Recommendations:</Text>
                {analysis.recommendations.map((recommendation, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.recommendationText}>{recommendation}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.bookAppointmentButton}
                onPress={() => navigation.navigate('BookAppointment')}
              >
                <Text style={styles.bookAppointmentButtonText}>
                  Book Appointment
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimerSection}>
          <Text style={styles.disclaimerTitle}>⚠️ Important Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            This AI symptom checker is for informational purposes only and should not replace professional medical advice. 
            Always consult with a qualified healthcare provider for proper diagnosis and treatment.
          </Text>
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
  section: {
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
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  symptomChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f2f6',
    marginRight: 8,
    marginBottom: 8,
  },
  symptomChipActive: {
    backgroundColor: '#3498db',
  },
  symptomChipText: {
    color: '#7f8c8d',
    fontSize: 14,
    fontWeight: '500',
  },
  symptomChipTextActive: {
    color: 'white',
  },
  customSymptomContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  customSymptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customSymptomInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    padding: 12,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedSymptomsContainer: {
    marginBottom: 20,
  },
  selectedSymptomsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedSymptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedSymptomText: {
    color: 'white',
    fontSize: 14,
    marginRight: 6,
  },
  removeSymptomButton: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  analyzeButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  analyzeButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  analysisCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  departmentText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  severityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  confidenceText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  symptomsList: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 15,
  },
  recommendationsContainer: {
    marginBottom: 20,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#3498db',
    marginRight: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  bookAppointmentButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  bookAppointmentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimerSection: {
    padding: 20,
    backgroundColor: '#fff3cd',
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});

export default SymptomCheckerScreen; 