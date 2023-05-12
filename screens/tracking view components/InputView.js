import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, ScrollView } from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import * as SQLite from 'expo-sqlite';

const screenWidth = Dimensions.get('window').width;

const db = SQLite.openDatabase('WeightTracker.db');

const resetDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql('DROP TABLE IF EXISTS measurements;', [], () => {
      console.log('Table dropped successfully');
    }, (_, error) => {
      console.error('Error dropping table:', error);
    });
  }, null, () => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS measurements (date TEXT PRIMARY KEY, weight REAL);',
        [],
        () => console.log('Table created successfully'),
        (_, error) => console.error('Error creating table:', error)
      );
    });
  });
};


db.transaction(tx => {
  tx.executeSql(
    'CREATE TABLE IF NOT EXISTS measurements (date TEXT PRIMARY KEY, weight REAL);',
    [],
    () => console.log('Table created successfully'),
    (_, error) => console.error('Error creating table:', error)
  );
});

const InputView = ({ onAddMeasurement }) => {
  const [date, setDate] = useState(new Date());
  const [weight, setWeight] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [customDatesStyles, setCustomDatesStyles] = useState([]);

  useEffect(() => {
    updateCustomDatesStyles();
  }, [date]);

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate.toDate());
    setDatePickerVisibility(false);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const handleAddMeasurement = () => {
    const dateString = date.toISOString().slice(0, 10);
    db.transaction(tx => {
      tx.executeSql(
        'INSERT OR REPLACE INTO measurements (date, weight) VALUES (?, ?);',
        [dateString, parseFloat(weight)],
        (_, resultSet) => {
          console.log('Weight measurement added/updated successfully');
          onAddMeasurement({ date: dateString, weight: parseFloat(weight) }); 
          setWeight('');
        },
        (_, error) => console.error('Error inserting/updating measurement:', error)
      );
    });
  };

  const updateCustomDatesStyles = () => {
    const today = new Date();
    const isTodaySelected = date.toDateString() === today.toDateString();
    const newCustomDatesStyles = [
      {
        date: today,
        style: { backgroundColor: isTodaySelected ? '#2f4f4f' : 'transparent' },
        textStyle: { color: isTodaySelected ? '#ffffff' : '#3a3a3a' },
      },
      {
        date: date,
        style: { backgroundColor: isTodaySelected ? 'transparent' : '#2f4f4f' },
        textStyle: { color: '#ffffff' },
      },
    ];
    setCustomDatesStyles(newCustomDatesStyles);
  };



  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Add Measurement</Text>
        <View style={styles.dateWeightContainer}>
          <TouchableOpacity onPress={showDatePicker} style={styles.datePicker}>
            <Text style={styles.datePickerText}>
              {date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={weight}
            onChangeText={(text) => {
              if (text === '' || /^\d*\.?\d*$/.test(text)) {
                setWeight(text);
              }
            }}
            placeholder="Enter weight"
          />
        </View>
        <TouchableOpacity onPress={handleAddMeasurement} style={styles.button}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
        {isDatePickerVisible && (
          <View style={styles.calendarWrapper}>
            <View style={styles.calendarContainer}>
              <CalendarPicker
                todayBackgroundColor="transparent"
                onDateChange={handleDateChange}
                width={screenWidth * 0.9}
                customDatesStyles={customDatesStyles}
                maxDate={new Date()}
              />
            </View>
          </View>
        )}
      </View>
      <TouchableOpacity onPress={resetDatabase} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>Reset Database</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 16,
    backgroundColor: '#2f4f4f',
    margin: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica',
    marginBottom: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  dateWeightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePicker: {
    height: 40,
    width: screenWidth * 0.4,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  datePickerText: {
    color: '#3a3a3a',
    fontFamily: 'Helvetica',
    fontSize: 18,
  },
  calendarContainer: {
    position: 'absolute',
    top: 110,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2f4f4f'
  },
  input: {
    height: 40,
    width: screenWidth * 0.4,
    backgroundColor: '#ffffff',
    paddingLeft: 8,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#ffc65a',
    borderRadius: 10,
    padding: 10,
    width: screenWidth * 0.3,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#3a3a3a',
    fontWeight: 'bold',
    fontSize: 18,
  },
  calendarWrapper: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#2f4f4f',
    borderRadius: 10,
    padding: 4,
    marginLeft:10,
    marginTop: 16,
    alignItems: 'left',
    alignSelf: 'bottom',
  },
  resetButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default InputView;