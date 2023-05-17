import React, { createContext, useState } from 'react';

export const WorkoutContext = createContext();

export function WorkoutProvider({ children }) {
  const [workoutDataChanged, setWorkoutDataChanged] = useState(false);

  const updateWorkoutData = () => {
    setWorkoutDataChanged(true);
  }

  return (
    <WorkoutContext.Provider value={{ workoutDataChanged, updateWorkoutData }}>
      {children}
    </WorkoutContext.Provider>
  );
}
