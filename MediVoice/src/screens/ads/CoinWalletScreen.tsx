import React from 'react';
import { View, Text, Button } from 'react-native';

const CoinWalletScreen = () => {
  // Placeholder for coin state and buy logic
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Coin Wallet</Text>
      <Text style={{ fontSize: 18, marginBottom: 24 }}>Coins: 0</Text>
      <Button title="Buy Medicine (200 coins)" onPress={() => {}} />
    </View>
  );
};

export default CoinWalletScreen; 