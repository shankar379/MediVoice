import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CoinContextProps {
  coins: number;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
}

const CoinContext = createContext<CoinContextProps | undefined>(undefined);

export const CoinProvider = ({ children }: { children: ReactNode }) => {
  const [coins, setCoins] = useState(0);

  const addCoins = (amount: number) => setCoins((c) => c + amount);
  const spendCoins = (amount: number) => {
    if (coins >= amount) {
      setCoins((c) => c - amount);
      return true;
    }
    return false;
  };

  return (
    <CoinContext.Provider value={{ coins, addCoins, spendCoins }}>
      {children}
    </CoinContext.Provider>
  );
};

export const useCoins = () => {
  const context = useContext(CoinContext);
  if (!context) {
    throw new Error('useCoins must be used within a CoinProvider');
  }
  return context;
}; 