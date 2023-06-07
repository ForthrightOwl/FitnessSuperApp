import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

export default function PrivacyPolicy({ goBack }) {
  const translateX = useRef(new Animated.Value(0)).current;

  return (
      <Animated.View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <Text>Privacy Policy</Text>
      </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  backButton: {
    backgroundColor: '#2f4f4f',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    alignSelf: 'left',
    justifyContent:'center'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
