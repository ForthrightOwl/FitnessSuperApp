import React, { useCallback, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Agenda } from 'react-native-calendars';
import moment from 'moment';
import * as SQLite from 'expo-sqlite';
import { WorkoutContext } from '../WorkoutContext';
import { useFocusEffect } from '@react-navigation/native';

const workoutDb = SQLite.openDatabase('workout_plan.db');

const getMostRecentDateFromDb = () => {
  return new Promise((resolve, reject) => {
    workoutDb.transaction((tx) => {
      tx.executeSql(
        `SELECT MAX(date) as maxDate FROM workout_plans`,
        [],
        (_, { rows }) => {
          if (rows._array && rows._array.length > 0) {
            resolve(rows._array[0].maxDate);
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          console.log("Error fetching the most recent date from database:", error);
          if (error.message.includes("no such table")) {
            resolve(null); // return null if there's no workout_plans table
          } else {
            reject(error);
          }
        }
      );
    });
  });
};


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
          // if error occurs, resolve with empty object
          if (error.message.includes("no such table")) {
            resolve({}); // return {} if there's no workout_plans table
          } else {
            resolve({});
          }
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
  useFocusEffect(
    React.useCallback(() => {
      // Check if there's any data loaded into workoutPlan
      if (Object.keys(workoutPlan).length === 0) {
        updateWorkoutData(true);
      }
  
      // No cleanup function needed
      return;
    }, [workoutPlan]) // Dependency on workoutPlan
  );

  const [workoutPlan, setWorkoutPlan] = React.useState({});
  const [currentWeek, setCurrentWeek] = React.useState({
    start: moment().subtract(2, 'weeks').startOf('isoWeek').format('YYYY-MM-DD'),
    end: moment().add(2, 'weeks').endOf('isoWeek').format('YYYY-MM-DD'),
  });
  const { workoutDataChanged, updateWorkoutData } = useContext(WorkoutContext);
  // existing state definitions
  const [copiedWorkoutPlan, setCopiedWorkoutPlan] = React.useState({});

  // get last two weeks workout plans
  // get last two weeks workout plans
const copyLastTwoWeeksWorkoutPlan = async () => {
  const mostRecentDate = await getMostRecentDateFromDb();
  if (mostRecentDate) {
    const twoWeeksBeforeRecent = moment(mostRecentDate).subtract(2, 'weeks').format('YYYY-MM-DD');
    const workoutPlanFromDb = await getWorkoutPlanFromDb(twoWeeksBeforeRecent, mostRecentDate);
    return workoutPlanFromDb;
  } else {
    console.log("No dates found in the database.");
    return null;
  }
};

  const handleWorkoutPlans = async (startIndex, endIndex, data, dates) => {
    // Extract workout plan
    let workoutPlanStr = data.content.slice(startIndex + 7, endIndex).trim();
  
    // Ensure that the extracted string is wrapped in curly braces
    if (!workoutPlanStr.startsWith('{')) {
      workoutPlanStr = '{' + workoutPlanStr;
    }
    if (!workoutPlanStr.endsWith('}')) {
      workoutPlanStr = workoutPlanStr + '}';
    }
  
    let workoutPlanObj;
    try {
      workoutPlanObj = JSON.parse(workoutPlanStr);
    } catch (error) {
      console.error('Error parsing workout plan:', error);
      return;
    }

    // Get the first date from the workout plan
  const firstDateFromPlan = Object.keys(workoutPlanObj)[0];

  // Check if the first date is in the dates
  if (!dates.includes(firstDateFromPlan)) {
    // Get the first date from the dates
    const firstDateFromList = dates[0];
    // Create a new workout plan object with updated dates
    const updatedWorkoutPlanObj = {};
    const originalDates = [];
    const newDates = [];
    for (const date in workoutPlanObj) {
      const dateObj = new Date(date);
      const daysDiff = Math.floor((dateObj - new Date(firstDateFromPlan)) / (1000 * 60 * 60 * 24));
      const newDateObj = new Date(firstDateFromList);
      newDateObj.setDate(newDateObj.getDate() + daysDiff);
      const newDate = newDateObj.toISOString().split('T')[0];
      updatedWorkoutPlanObj[newDate] = workoutPlanObj[date];
      // Store original and new dates for logging
      originalDates.push(date);
      newDates.push(newDate);
    }
    // Update the workoutPlanObj to be the updatedWorkoutPlanObj
    workoutPlanObj = updatedWorkoutPlanObj;

    console.log(`Dates needed to be changed. Changed: ${originalDates} to ${newDates}`);
  }
  
    // Insert the new plans
    workoutDb.transaction(tx => {
      Object.keys(workoutPlanObj).forEach(date => {
        let plan = JSON.stringify(workoutPlanObj[date]);

        tx.executeSql(
          `INSERT OR REPLACE INTO workout_plans (date, plan) VALUES (?, ?);`,
          [date, plan],
          (_, resultSet) => {
            console.log('Workout plan had fewer than 7 days left, it is now updated.');
          },
          (_, error) => {
            console.error(`Error saving workout plan to database:`, error);
          }
        );
      });
      updateWorkoutData(true);
    });
  };

  const fetchAndSaveWorkoutPlans = async (copiedWorkoutPlan) => {
    // prepare the existing plan and the dates for the next two weeks
    const lastPlanDate = Object.keys(copiedWorkoutPlan).sort().slice(-1)[0];
    console.log('Last date of the plan:' + lastPlanDate)
    
    
    let nextStartDate = moment(lastPlanDate).add(1, 'days');

// Check if nextStartDate is not a Monday
if (nextStartDate.day() !== 1) {
    // If not, set it to the next Monday
    let daysUntilNextMonday = 1 - nextStartDate.day();
    if (daysUntilNextMonday <= 0) { // This means it's currently after Monday (e.g. Tuesday, Wednesday, etc.) 
        daysUntilNextMonday += 7; // This will add 7 days to negative values, effectively getting the number of days until the next Monday
    }
    nextStartDate.add(daysUntilNextMonday, 'days');
}


    nextStartDate = nextStartDate.format('YYYY-MM-DD');
    console.log('First date of the new plan:' + nextStartDate)
    const dates = [];
    for (let i = 0; i < 14; i++) {
      dates.push(moment(nextStartDate).add(i, 'days').format('YYYY-MM-DD'));
    }
  
    const existingPlan = JSON.stringify(copiedWorkoutPlan);
    const existingPlanStr = existingPlan.slice(1, existingPlan.length - 1); // remove the outer curly braces
  
    // Message to be sent goes here
    const messages = [
      {
        role: 'user',
        content: `I am currently following a workout plan, but it expires next week. Can you create another two weeks of my program? 

        Please only program the same days as the current program and maintain the spacing between them to respect the rest days that are needed. Retain the structure of workout days and only change the non core exercises and rep ranges.
          
                You are a part of an app and it is essential you follow these instructions EXACTLY for the app to function properly:
                1. When specifying workouts always begin with a token !wkst! and end with a token !wknd! , specify the plan in JSON format with stringified date as the key and an array containing objects with title and content properties as content. Here is an example: !wkst!{“YYYY-MM-DD”: [{“title": title for the section, "content": workout specifics}], … rest of the dates}!wknd!, for each of the following dates:${dates}.
          
                Here is my current workout plan that is to be extended: ${existingPlanStr} `
              }
    ];
  
    try {
      console.log("Requested plan extension with: " + messages)
      const response = await fetch('https://us-central1-centered-carver-385915.cloudfunctions.net/fitnessChatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API responded with an error: ${errorText}`);
      }
  
      let data = await response.json();
      const workoutStartIndex = data.content.indexOf('!wkst!');
      const workoutEndIndex = data.content.indexOf('!wknd!');
  
      if (workoutStartIndex !== -1 && workoutEndIndex !== -1) {
        data = await handleWorkoutPlans(workoutStartIndex, workoutEndIndex, data, dates);
      }
  
      return data;
  
    } catch (error) {
      console.error('Error fetching workout plan:', error);
    }
  };
  
  

  const checkLastDate = async () => {
    const lastDate = await getMostRecentDateFromDb();
    if (lastDate) {
      console.log('The last date now is: ' + lastDate)
      let isGreaterThanSevenDays = moment(lastDate).isAfter(moment().add(7, 'days'));
      if (!isGreaterThanSevenDays) {
        // Fetch and save new workout plans
        console.log('Workout expiring in a week. Requesting a 2 week extension.')
        const copiedWorkoutPlan = await copyLastTwoWeeksWorkoutPlan();
        if(copiedWorkoutPlan && Object.keys(copiedWorkoutPlan).length > 0) {
          await fetchAndSaveWorkoutPlans(copiedWorkoutPlan);
        } else {
          console.log("Could not copy last two week's workout plan. Cancelling API call.");
        }
      }
    } else {
      console.log("No dates found in the database.");
    }
  };

  const lastWorkoutFetchTime = React.useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      // async function to be called
      const fetchData = async () => {
        const currentTime = Date.now();
        // Only run if more than 10 minutes has passed since the last run
        if (lastWorkoutFetchTime.current === null || currentTime - lastWorkoutFetchTime.current >= 10 * 60 * 1000) {
          await copyLastTwoWeeksWorkoutPlan();
          await checkLastDate();
          // Update the last fetch time
          lastWorkoutFetchTime.current = Date.now();
        }
      }

    // run async function
    fetchData();
  
    // no cleanup function needed
    return;
  }, [])
);

  const renderItem = useCallback((item) => {
    return <WorkoutItem title={item.title} content={item.content} />;
  }, []);

  const renderEmptyDate = useCallback(() => {
    return <EmptyWorkout />;
  }, []);

  const renderDay = useCallback(() => {
    return null;
  }, []);

  useFocusEffect(
    React.useCallback(() => {
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
      }
    }, [workoutDataChanged, currentWeek])
  );

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
  const selectedWeekStart = moment(day.dateString).subtract(2, 'weeks').startOf('isoWeek').format('YYYY-MM-DD');
  const selectedWeekEnd = moment(day.dateString).add(2, 'weeks').endOf('isoWeek').format('YYYY-MM-DD');
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