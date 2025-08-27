import React from 'react';
import { View, Text, Button, FlatList } from 'react-native';

const MedicineRemindersScreen = () => {
  // Placeholder for reminders state and logic
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Medicine Reminders</Text>
      {/* TODO: List reminders here */}
      <FlatList data={[]} renderItem={() => null} />
      <Button title="Add Reminder" onPress={() => {}} />
    </View>
  );
};

export default MedicineRemindersScreen; 