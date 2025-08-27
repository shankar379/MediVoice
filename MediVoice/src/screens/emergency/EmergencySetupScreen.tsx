import React from 'react';
import { View, Text, Button, FlatList } from 'react-native';

const EmergencySetupScreen = () => {
  // Placeholder for contacts state and logic
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Emergency Contacts</Text>
      {/* TODO: List contacts here */}
      <FlatList data={[]} renderItem={() => null} />
      <Button title="Add Contact" onPress={() => {}} />
    </View>
  );
};

export default EmergencySetupScreen; 