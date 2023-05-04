import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Agenda } from 'react-native-calendars';
import moment from 'moment';

const today = moment().startOf('day');
const nutritionPlan = {
  "2023-04-24": [
    {
      "title": "Breakfast",
      "content": "2 scrambled eggs, 1 slice of whole grain toast, and a glass of orange juice."
    },
    {
      "title": "Lunch",
      "content": "Grilled chicken salad with mixed greens, cherry tomatoes, cucumbers, and balsamic vinaigrette."
    },
    {
      "title": "Dinner",
      "content": "Baked salmon with quinoa and steamed broccoli."
    }
  ],
  // ... Add more dates and meals here
};

const NutritionItem = ({ title, content }) => {
  return (
    <View style={styles.item}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>{content}</Text>
    </View>
  );
};

const EmptyNutrition = () => {
  return (
    <View style={styles.emptyDate}>
      <Text style={styles.emptyDateText}>No meals scheduled for today</Text>
    </View>
  );
};

export default function Nutrition() {
  const renderItem = useCallback((item) => {
    return <NutritionItem title={item.title} content={item.content} />;
  }, []);

  const renderEmptyDate = useCallback(() => {
    return <EmptyNutrition />;
  }, []);

  const renderDay = useCallback(() => {
    return null;
  }, []);

  return (
    <View style={styles.container}>
        <Agenda
          items={nutritionPlan}
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