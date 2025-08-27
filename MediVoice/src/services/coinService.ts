import AsyncStorage from '@react-native-async-storage/async-storage';

const COINS_KEY = 'MEDIVOICE_COINS';

export const getCoins = async (): Promise<number> => {
  const coins = await AsyncStorage.getItem(COINS_KEY);
  return coins ? parseInt(coins, 10) : 0;
};

export const addCoins = async (amount: number) => {
  const current = await getCoins();
  await AsyncStorage.setItem(COINS_KEY, (current + amount).toString());
};

export const spendCoins = async (amount: number): Promise<boolean> => {
  const current = await getCoins();
  if (current >= amount) {
    await AsyncStorage.setItem(COINS_KEY, (current - amount).toString());
    return true;
  }
  return false;
}; 