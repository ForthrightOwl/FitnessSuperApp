import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Agenda } from 'react-native-calendars';
import moment from 'moment';

const today = moment().startOf('day');
const workoutPlan = {
"2023-04-24":[{
"content": "Warm-up: 10-minute jog, 2 rounds of 10 burpees, 10 air squats, 10 push-ups.\n\nStrength: 5 sets of 3 reps of deadlifts (70-75% of your 1 rep max).\n\nConditioning: 4 rounds for time of: 20 kettlebell swings (24kg), 15 box jumps (24in), 10 pull-ups."}],

"2023-04-25":[{
"content": "Warm-up: 10-minute row, 2 rounds of 10 push press (45lbs), 10 walking lunges.\n\nStrength: 5 sets of 5 reps of push press (70-75% of your 1 rep max).\n\nConditioning: 5 rounds for time of: 10 burpee box jump overs (24in), 15 dumbbell thrusters (35lbs), 20/15 calorie row."}],

"2023-04-27":[{
"content": "Warm-up: 10-minute jog, 2 rounds of 10 bench press (45lbs), 10 sit-ups.\n\nStrength: 5 sets of 5 reps of bench press (70-75% of your 1 rep max).\n\nConditioning: 21-15-9 reps for time of: dumbbell snatches (50lbs), burpees."}],

"2023-04-29":[{
"content": "Warm-up: 10-minute row, 2 rounds of 10 overhead squats (45lbs), 10 ring rows.\n\nStrength: 5 sets of 3 reps of overhead squats (70-75% of your 1 rep max).\n\nConditioning: 5 rounds for time of: 10 box step-ups (24in, 50lbs dumbbells), 15 ring dips, 20 wall balls (20lbs)."}],

"2023-05-01":[{
"content": "Rest Day."}],

"2023-05-02":[{
"content": "Warm-up: 10-minute run, 2 rounds of 10 front squats (45lbs), 10 pull-ups.\n\nStrength: 5 sets of 5 reps of front squats (70-75% of your 1 rep max).\n\nConditioning: 5 rounds for time of: 15/12 calorie bike, 10 front rack lunges (95lbs), 5 bar muscle-ups."}],

"2023-05-04":[{
"content": "Warm-up: 10-minute row, 2 rounds of 10 push press (45lbs), 10 ring rows.\n\nStrength: 5 sets of 3 reps of push press (70-75% of your 1 rep max).\n\nConditioning: 5 rounds for time of: 10 shoulder-to-overheads (115lbs), 15 chest-to-bar pull-ups, 20 box jumps (24in)."}],

"2023-05-06":[{
"content": "Warm-up: 10-minute jog, 2 rounds of 10 deadlifts (45lbs), 10 sit-ups.\n\nStrength: 5 sets of 5 reps of deadlifts (70-75% of your 1 rep max).\n\nConditioning: 3 rounds for time of: 400m run, 30 kettlebell swings (24kg), 20abmat sit-ups."}],

"2023-05-08":[{
"content": "Rest Day."}],

"2023-05-09":[{
"content": "Warm-up: 10-minute row, 2 rounds of 10 bench press (45lbs), 10 air squats.\n\nStrength: 5 sets of 3 reps of bench press (70-75% of your 1 rep max).\n\nConditioning: 4 rounds for time of: 20 dumbbell snatches (50lbs), 15/12 calorie row, 10 handstand push-ups."}],

"2023-05-11":[{
"content": "Warm-up: 10-minute jog, 2 rounds of 10 thrusters (45lbs), 10 pull-ups.\n\nStrength: 5 sets of 5 reps of thrusters (70-75% of your 1 rep max).\n\nConditioning: 21-15-9 reps for time of: dumbbell box step-overs (24in, 50lbs), pull-ups."}],

"2023-05-13":[{
"content": "Warm-up: 10-minute row, 2 rounds of 10 overhead squats (45lbs), 10 ring dips.\n\nStrength: 5 sets of 3 reps of overhead squats (70-75% of your 1 rep max).\n\nConditioning: 5 rounds for time of: 10 devil's press (50lbs), 15 burpee box jump overs (24in), 20 wall balls (20lbs)."}],

"2023-05-15":[{
"content": "Rest Day."}],

"2023-05-16":[{
"content": "Warm-up: 10-minute jog, 2 rounds of 10 deadlifts (45lbs), 10 ring rows.\n\nStrength: 5 sets of 5 reps of deadlifts (70-75% of your 1 rep max).\n\nConditioning: 5 rounds for time of: 12/9 calorie bike, 10 dumbbell front squats (35lbs), 8 bar muscle-ups."}],

"2023-05-18":[{
"content": "Warm-up: 10-minute row, 2 rounds of 10 push press (45lbs), 10 air squats.\n\nStrength: 5 sets of 3 reps of push press (70-75% of your 1 rep max).\n\nConditioning: 5 rounds for time of: 10 thrusters (95lbs), 15 chest-to-bar pull-ups, 20 box jumps (24in)."}],

"2023-05-20":[{
"content": "Warm-up: 10-minute jog, 2 rounds of 10 bench press (45lbs), 10 sit-ups.\n\nStrength: 5 sets of 5 reps of bench press (70-75% of your 1 rep max).\n\nConditioning: 3 rounds for time of: 400m run, 30 dumbbell snatches (50lbs), 20 ring dips."}],

"2023-05-22":[{
"content": "Rest Day."}],

"2023-05-23":[{
"content": "Warm-up: 10-minute row, 2 rounds of 10 overhead squats (45lbs), 10 pull-ups.\n\nStrength: 5 sets of 3 reps of overhead squats (70-75% of your 1 rep max).\n\nConditioning: 4 rounds for time of: 20 kettlebell swings (24kg), 15/12calorie row, 10 handstand push-ups."}],

"2023-05-25":[{
"content": "Warm-up: 10-minute jog, 2 rounds of 10 thrusters (45lbs), 10 ring rows.\n\nStrength: 5 sets of 5 reps of thrusters (70-75% of your 1 rep max).\n\nConditioning: 21-15-9 reps for time of: dumbbell box step-overs (24in, 50lbs), chest-to-bar pull-ups."}],

"2023-05-27":[{
"content": "Warm-up: 10-minute row, 2 rounds of 10 deadlifts (45lbs), 10 air squats.\n\nStrength: 5 sets of 3 reps of deadlifts (70-75% of your 1 rep max).\n\nConditioning: 5 rounds for time of: 10 devil's press (50lbs), 15 burpee box jump overs (24in), 20 wall balls (20lbs)."}],

"2023-05-29":[{
"content": "Rest Day."}],

"2023-05-30":[{
"content": "Warm-up: 10-minute jog, 2 rounds of 10 bench press (45lbs), 10 pull-ups.\n\nStrength: 5 sets of 5 reps of bench press (70-75% of your 1 rep max).\n\nConditioning: 5 rounds for time of: 12/9 calorie bike, 10 dumbbell front squats (35lbs), 8 bar muscle-ups."}],

"2023-06-01":[{
"content": "Warm-up: 10-minute row, 2 rounds of 10 push press (45lbs), 10 air squats.\n\nStrength: 5 sets of 3 reps of push press (70-75% of your 1 rep max).\n\nConditioning: 5 rounds for time of: 10 thrusters (95lbs), 15 chest-to-bar pull-ups, 20 box jumps (24in)."}],

"2023-06-03":[{
"content": "Warm-up: 10-minute jog, 2 rounds of 10 deadlifts (45lbs), 10 sit-ups.\n\nStrength: 5 sets of 5 reps of deadlifts (70-75% of your 1 rep max).\n\nConditioning: 3 rounds for time of: 400m run, 30 kettlebell swings (24kg), 20 ring dips."}],

"2023-06-05":[{
"content": "Rest Day."}]
};

const WorkoutItem = ({ title, content }) => {
  return (
    <View style={styles.item}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>{content}</Text>
    </View>
  );
};

const EmptyWorkout = () => {
  return (
    <View style={styles.emptyDate}>
      <Text style={styles.emptyDateText}>Rest day</Text>
    </View>
  );
};

export default function Workout() {
  const renderItem = useCallback((item) => {
    return <WorkoutItem title={item.title} content={item.content} />;
  }, []);

  const renderEmptyDate = useCallback(() => {
    return <EmptyWorkout />;
  }, []);

  const renderDay = useCallback(() => {
    return null;
  }, []);

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
            textDisabledColor: '#ffffff',
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