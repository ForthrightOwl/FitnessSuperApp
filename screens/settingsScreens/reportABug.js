import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { addDoc, collection } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig'; 
import Toast from 'react-native-toast-message';

export default function ReportBug({ goBack }) {
  const [text, setText] = useState('');

  const submitRequest = async (bugReport) => {
    try {
      await addDoc(collection(firestore, 'bugReports'), {
        text: bugReport,
        timestamp: new Date().toISOString(),
      });
      console.log('Bug reported!');
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  const handleSubmit = () => {
    submitRequest(text)
      .then(() => {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Bug successfully reported!',
        });
        setText('');
      })
      .catch((error) => {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Error',
          text2: 'There was an issue submitting your bug report.',
        });
        console.log('Error submitting request: ', error);
      });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Report a Bug</Text>
      <Text style={styles.body}>We strive to provide a seamless experience, but sometimes bugs happen. If you come across any issues or glitches in our app, please let us know. We appreciate your help in making our app even better!</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        style={styles.inputBox}
        placeholder="Enter your bug report"
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
    alignSelf: 'flex-start',
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2f4f4f',
    marginTop: 10,
    fontFamily: 'Helvetica',
  },
  body: {
    fontSize: 16,
    textAlign: 'left',
    color: '#3a3a3a',
    marginTop: 10,
    marginBottom:10,
    fontFamily: 'Helvetica',
    padding:10
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


