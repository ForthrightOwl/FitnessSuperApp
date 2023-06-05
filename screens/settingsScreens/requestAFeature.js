import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { addDoc, collection } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig'; 
import Toast from 'react-native-toast-message';

export default function RequestFeature({ goBack }) {
  const [text, setText] = useState('');

  const submitRequest = async (featureRequest) => {
    try {
      await addDoc(collection(firestore, 'featureRequests'), {
        text: featureRequest,
        timestamp: new Date().toISOString(),
      });
      console.log('Request added!');
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
          text1: 'Feature successfully requested!',
        });
        setText('');
      })
      .catch((error) => {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Error',
          text2: 'There was an issue submitting your feature request.',
        });
        console.error('Error submitting request: ', error);
      });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Request a Feature</Text>
      <Text style={styles.body}>Your feedback is valuable to us! Is there a specific feature you'd love to see in our app? We'd love to hear your ideas and suggestions. Share your thoughts on what would make your fitness journey even better!</Text>
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


