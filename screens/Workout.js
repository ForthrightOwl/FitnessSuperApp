import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Agenda } from 'react-native-calendars';
import moment from 'moment';
import * as SQLite from 'expo-sqlite';
import { useIsFocused } from '@react-navigation/native';

// Open the database, the function openDatabase takes a single string argument
// which is the name of the database file.
const workoutDb = SQLite.openDatabase('workout_plan.db');

const getWorkoutPlanFromDb = async () => {
  return new Promise((resolve, reject) => {
    workoutDb.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM workout_plans",
        [],
        (_, { rows }) => {
          if (rows._array.length > 0) {
            console.log(rows._array)
            let workoutPlans = rows._array;
            let formattedWorkoutPlans = {};
            // Parse all plans into objects and format them
            workoutPlans.forEach(workoutPlan => {
              let plansArray = JSON.parse(workoutPlan.plan);
              formattedWorkoutPlans[workoutPlan.date] = plansArray.map(plan => ({
                title: plan.title,
                content: plan.content,
              }));
            });
            console.log(formattedWorkoutPlans);
            resolve(formattedWorkoutPlans);
          } else {
            resolve({});
          }
        },
        (_, error) => {
          console.log("Error fetching workouts from database:", error);
          reject(error);
        }
      );
    });
  });
};



const today = moment().startOf('day');

const WorkoutItem = React.memo(({ title, content }) => {
  return (
    <View style={styles.item}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>{content}</Text>
    </View>
  );
});


const EmptyWorkout = () => {
  return (
    <View style={styles.emptyDate}>
      <Text style={styles.emptyDateText}>Rest day</Text>
    </View>
  );
};

export default function Workout() {
  const [workoutPlan, setWorkoutPlan] = React.useState({});
  const isFocused = useIsFocused();

  const renderItem = useCallback((item) => {
    return <WorkoutItem title={item.title} content={item.content} />;
  }, []);

  const renderEmptyDate = useCallback(() => {
    return <EmptyWorkout />;
  }, []);

  const renderDay = useCallback(() => {
    return null;
  }, []);

  React.useEffect(() => {
    const fetchWorkoutPlan = async () => {
      try {
        const workoutPlanFromDb = await getWorkoutPlanFromDb();
        setWorkoutPlan(workoutPlanFromDb);
      } catch (error) {
        console.error("Error fetching workout plan from database:", error);
      }
    };

    if (isFocused) {
      fetchWorkoutPlan();
    }
  }, [isFocused]);


  return (
    <View style={styles.container}>
        <Agenda
          items={workoutPlan}
          renderItem={renderItem}
          renderEmptyData={renderEmptyDate}
          renderDay={renderDay}
          firstDay={1}
          showOnlySelectedDayItems
          theme={{
            backgroundColor: '#ffffff',
            fontFamily: 'Helvetica',
            calendarBackground: '#ffffff',
            agendaKnobColor: '#2f4f4f',
            dayTextColor: "#2f4f4f",
            todayTextColor: "#2f4f4f",
            selectedDayBackgroundColor: '#2f4f4f',
            selectedDayTextColor: '#ffffff',
            agendaDayNumColor: '#2f4f4f',
            textSectionTitleColor: '#2f4f4f',
            textDayHeaderFontSize: 15,
            textMonthFontSize: 18,
            monthTextColor:"#2f4f4f",
            textDayFontSize: 17,
            textDisabledColor: '#2f4f4f',
            dotColor:"#2f4f4f",
           }}
        style={{backgroundColor:"#ffffff"}}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  item: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 20,
  },
  title: {
    fontFamily: 'Helvetica',
    fontSize: 17,
    fontWeight: 'bold',
    color: '#3a3a3a',
    marginBottom: 5,
  },
  content: {
    fontFamily: 'Helvetica',
    fontSize: 15,
    color: '#3a3a3a',
    lineHeight:20
  },
  emptyDate: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 17,
    borderColor: 'fffaf3',
    borderWidth: 0,
  },
  emptyDateText: {
    fontFamily: 'Helvetica',
    fontSize: 16,
    color: '#3a3a3a',
  },
  selectedDate:{
    backgroundColor: '#2f4f4f',
    textColor: '#ffffff',
    borderRadius:0
  },
    });