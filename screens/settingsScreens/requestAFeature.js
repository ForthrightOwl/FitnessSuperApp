import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

export default function RequestFeature({ goBack }) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    // Send the text to the email address.
    setText('');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Request a Feature</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        style={styles.inputBox}
        placeholder="Enter your feature request"
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 10,
    backgroundColor:'#ffffff',
    minHeight:'100%'
  },
  backButton: {
    backgroundColor: '#2f4f4f',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    alignSelf: 'left',
    justifyContent:'center',
    marginBottom:'30%'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2f4f4f',
    padding: 10,
    borderRadius: 10,
    marginVertical: 20,
    justifyContent:'center',
    width:'40%',
    alignItems:'center'
  },
  title: {
    fontSize: 20,
    margin:20,
    color:'#2f4f4f',
    fontWeight:'bold'
  },
  inputBox: {
    borderColor:'#2f4f4f',
    borderWidth:2,
    borderRadius:10,
    width:'90%',
    height:'30%',
    padding:10,
    alignItems:'baseline',
  }
});


