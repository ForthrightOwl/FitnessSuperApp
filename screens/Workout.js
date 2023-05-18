import React, { useCallback, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Agenda } from 'react-native-calendars';
import moment from 'moment';
import * as SQLite from 'expo-sqlite';
import { WorkoutContext } from '../WorkoutContext';

const workoutDb = SQLite.openDatabase('workout_plan.db');

const getWorkoutPlanFromDb = async (startOfWeek, endOfWeek) => {
  return new Promise((resolve, reject) => {
    const sqlStart = Date.now();

    const query = `SELECT * FROM workout_plans WHERE date >= ? AND date <= ?`;

    workoutDb.transaction((tx) => {
      tx.executeSql(
        query,
        [startOfWeek, endOfWeek],
        (_, { rows }) => {
          const sqlEnd = Date.now();
          console.log("SQL execution time: " + (sqlEnd - sqlStart) + "ms");

          const formatStart = Date.now();

          if (rows._array.length > 0) {
            let workoutPlans = rows._array;
            let formattedWorkoutPlans = {};
            workoutPlans.forEach(workoutPlan => {
              let plansArray = JSON.parse(workoutPlan.plan);
              formattedWorkoutPlans[workoutPlan.date] = plansArray.map(plan => ({
                title: plan.title,
                content: plan.content,
              }));
            });

            const formatEnd = Date.now();
            console.log("Data formatting time: " + (formatEnd - formatStart) + "ms");

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
  const [currentWeek, setCurrentWeek] = React.useState({
    start: moment().subtract(2, 'weeks').startOf('week').format('YYYY-MM-DD'),
    end: moment().add(2, 'weeks').endOf('week').format('YYYY-MM-DD'),
  });
  const { workoutDataChanged, updateWorkoutData } = useContext(WorkoutContext);

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
      const fetchStart = Date.now();
  
      try {
        const workoutPlanFromDb = await getWorkoutPlanFromDb(currentWeek.start, currentWeek.end);
        
        const setStart = Date.now();
        setWorkoutPlan(workoutPlanFromDb);
        const setEnd = Date.now();
        console.log("Set state time: " + (setEnd - setStart) + "ms");

        updateWorkoutData(false);
  
      } catch (error) {
        console.error("Error fetching workout plan from database:", error);
      }
      const fetchEnd = Date.now();
console.log("Total Fetching Workout Plan time: " + (fetchEnd - fetchStart) + "ms");
};
if (workoutDataChanged) {
  fetchWorkoutPlan();
}}, [workoutDataChanged, currentWeek]);

return (
<View style={styles.container}>
<Agenda
items={workoutPlan}
renderItem={renderItem}
renderEmptyData={renderEmptyDate}
renderDay={renderDay}
firstDay={1}
showOnlySelectedDayItems
onDayPress={(day) => {
  const selectedWeekStart = moment(day.dateString).subtract(2, 'weeks').startOf('week').format('YYYY-MM-DD');
  const selectedWeekEnd = moment(day.dateString).add(2, 'weeks').endOf('week').format('YYYY-MM-DD');
  if (selectedWeekStart !== currentWeek.start || selectedWeekEnd !== currentWeek.end) {
    setCurrentWeek({
      start: selectedWeekStart,
      end: selectedWeekEnd,
    });
  }
}}
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
style={{backgroundColor:"#ffffff"}}
/>
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