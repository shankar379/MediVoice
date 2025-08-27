import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { MediVoiceProvider } from './src/contexts/MediVoiceContext';
import { RoleProvider } from './src/contexts/RoleContext';
import { CoinProvider } from './src/contexts/CoinContext';
import { SuperAdminProvider } from './src/contexts/SuperAdminContext';

export default function App() {
  return (
    <LanguageProvider>
      <SafeAreaProvider>
        <RoleProvider>
          <CoinProvider>
            <MediVoiceProvider>
              <SuperAdminProvider>
              <AuthProvider>
                <AppNavigator />
                <StatusBar style="auto" />
              </AuthProvider>
              </SuperAdminProvider>
            </MediVoiceProvider>
          </CoinProvider>
        </RoleProvider>
      </SafeAreaProvider>
    </LanguageProvider>
  );
}
