import React from 'react';
import { View, Text, Button } from 'react-native';

const WatchAdsScreen = () => {
  // Placeholder for ad logic and coin state
  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Watch Ads, Earn Coins</Text>
      <Text style={{ fontSize: 18, marginBottom: 24 }}>Coins: 0</Text>
      <Button title="Watch Ad" onPress={() => {}} />
    </View>
  );
};

export default WatchAdsScreen; 