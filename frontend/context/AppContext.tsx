'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AHPCalculateResponse } from '@/types/ahp';
import { Restaurant } from '@/types/restaurant';

interface AppContextType {
  ahpResult: AHPCalculateResponse | null;
  setAhpResult: (result: AHPCalculateResponse | null) => void;
  restaurants: Restaurant[];
  setRestaurants: (restaurants: Restaurant[]) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [ahpResult, setAhpResult] = useState<AHPCalculateResponse | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);

  return (
    <AppContext.Provider value={{ ahpResult, setAhpResult, restaurants, setRestaurants, currentStep, setCurrentStep }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
