import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import RequestFeature from '../screens/settingsScreens/requestAFeature';
import ReportBug from '../screens/settingsScreens/reportABug';
import * as SQLite from 'expo-sqlite';
import { WorkoutContext } from '../WorkoutContext';
import { NutritionContext } from '../NutritionContext';
import { ResetChatContext } from '../ResetChatContext';

// Initialize the databases
const workoutDb = SQLite.openDatabase('workout_plan.db');
const nutritionDb = SQLite.openDatabase('nutrition_plan.db');

export default function Settings() {
  const [screen, setScreen] = useState('Settings');

  const { updateWorkoutData } = useContext(WorkoutContext);
  const { updateNutritionData } = useContext(NutritionContext);
  const { setResetChat } = useContext(ResetChatContext);

  const clearDatabases = () => {
    workoutDb.transaction(tx => {
      tx.executeSql('DROP TABLE IF EXISTS workout_plans', [], 
        () => console.log('Workout Plan database cleared'), 
        updateWorkoutData(true),
        (tx, err) => console.log('Error: ' + err)
      );
    });
    
    nutritionDb.transaction(tx => {
      tx.executeSql('DROP TABLE IF EXISTS nutrition_plans', [], 
        () => console.log('Nutrition Plan database cleared'), 
        updateNutritionData(true),
        (tx, err) => console.log('Error: ' + err)
      );
    });
  };

  const resetChatHistory = () => {
    setResetChat(true);
  };

  const openURL = () => {
    Linking.canOpenURL('https://kinergo.app/app-privacypolicy/')
      .then((supported) => {
        if (!supported) {
          console.log("Can't handle URL: ");
        } else {
          return Linking.openURL('https://kinergo.app/app-privacypolicy/');
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  if (screen === 'Settings') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={openURL}>
          <Text style={styles.buttonText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setScreen('RequestFeature')}>
          <Text style={styles.buttonText}>Request a Feature</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setScreen('ReportBug')}>
          <Text style={styles.buttonText}>Report a Bug</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={clearDatabases}>
          <Text style={styles.buttonText}>Delete Workout & Nutrition Plans</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={resetChatHistory}> 
          <Text style={styles.buttonText}>Delete Chat History</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (screen === 'RequestFeature') {
    return <RequestFeature goBack={() => setScreen('Settings')} />;
  }

  if (screen === 'ReportBug') {
    return <ReportBug goBack={() => setScreen('Settings')} />;
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  button: {
    backgroundColor: '#2f4f4f',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#4f2f2f',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
});
