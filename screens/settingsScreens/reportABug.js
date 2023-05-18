import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

export default function ReportBug({ goBack }) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    // Send the bug report to the email address.
    setText('');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={goBack}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
      <Text>Report a Bug</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Describe the bug"
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  button: {
    backgroundColor: '#2f4f4f',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '20%',
    alignSelf: 'left',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

