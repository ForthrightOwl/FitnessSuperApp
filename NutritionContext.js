import React, { createContext, useState } from 'react';

export const NutritionContext = createContext();

export function NutritionProvider({ children }) {
  const [nutritionDataChanged, setNutritionDataChanged] = useState(false);

  const updateNutritionData = () => {
    setNutritionDataChanged(true);
  }

  return (
    <NutritionContext.Provider value={{ nutritionDataChanged, updateNutritionData }}>
      {children}
    </NutritionContext.Provider>
  );
}
