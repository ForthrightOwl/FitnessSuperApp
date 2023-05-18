import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PrivacyPolicy from '../screens/settingsScreens/privacyPolicy';
import RequestFeature from '../screens/settingsScreens/requestAFeature';
import ReportBug from '../screens/settingsScreens/reportABug';

export default function Settings() {
  const [screen, setScreen] = useState('Settings');

  if (screen === 'Settings') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={() => setScreen('PrivacyPolicy')}>
          <Text style={styles.buttonText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setScreen('RequestFeature')}>
          <Text style={styles.buttonText}>Request a Feature</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setScreen('ReportBug')}>
          <Text style={styles.buttonText}>Report a Bug</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (screen === 'PrivacyPolicy') {
    return <PrivacyPolicy goBack={() => setScreen('Settings')} />;
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
});
