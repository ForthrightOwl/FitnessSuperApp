import React, { useState, useEffect, useContext } from 'react';
import { GiftedChat, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import { TouchableOpacity, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { WorkoutContext } from '../WorkoutContext';
import { NutritionContext } from '../NutritionContext';

// Initialize the databases
const workoutDb = SQLite.openDatabase('workout_plan.db');
const nutritionDb = SQLite.openDatabase('nutrition_plan.db');

// Create tables
const createWorkoutTable = () => {
  workoutDb.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS workout_plans (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, plan TEXT);`
    );
  });
};


const createNutritionTable = () => {
  nutritionDb.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS nutrition_plans (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, plan TEXT);`
    );
  });
};

const generateDateList = () => {
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 14); // Add 2 weeks (14 days) to the current date

  const dateList = [];

  for (let currentDate = startDate; currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
    dateList.push(formatDate(new Date(currentDate)));
  }

  return dateList;
};

const dateList = generateDateList();

let initialMessage = `You are now BodyGenius, a personal fitness super assistant. Your objective is to help your client achieve their fitness goals by creating professional and scientific workouts and meal plans, and by being a useful resource to answer any fitness related questions. Ask lots of questions to understand your client and personalize your advice to them. Consider their gender, age, experience, goals, schedule preferences and other similar important factors when creating their workout and nutrition plans.

You are a part of an app and it is essential you follow these instructions EXACTLY for the app to function properly:
1. When specifying workouts always begin with a token !wkst! and end with a token !wknd! , specify the plan in JSON format with stringified date as the key and an array containing objects with title and content properties as content. Here is an example: !wkst!{“YYYY-MM-DD”: [{“title": title for the section, "content": workout specifics}], … rest of the dates}!wknd!, for each of the following dates:${dateList}. Your workout plan will be stripped out of the message displayed to the user, invite them to review the plan in the workouts tab.
2. Follow the same format for nutrition, only with tokens !ntst! to start and !ntnd! to end. Specify each meal for every date.
3. There is a progress tracking screen, so if the client asks about tracking their progress redirect them there.

Provide plentiful detail in workout and nutrition plans. Always encourage your client to exercise their own judgement in regards to their health. When giving exercise form advice, always provide a link to an instructional video.

If you are asked to edit an existing workout plan, but the plan is not included, reply !wk?, for the nutrition plan reply !nt?.`
const initialBGMessage = `How can I help you today?`



export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  const { updateWorkoutData } = useContext(WorkoutContext);
  const { updateNutritionData } = useContext(NutritionContext);

  const getPlanFromDb = async (db, tableName, startOfWeek, endOfWeek) => {
    return new Promise((resolve, reject) => {
      const sqlStart = Date.now();
  
      const query = `SELECT * FROM ${tableName} WHERE date >= ? AND date <= ?`;
  
      db.transaction((tx) => {
        tx.executeSql(
          query,
          [startOfWeek, endOfWeek],
          (_, { rows }) => {
            const sqlEnd = Date.now();
            console.log("SQL execution time: " + (sqlEnd - sqlStart) + "ms");
  
            const formatStart = Date.now();
  
            if (rows._array.length > 0) {
              let plans = rows._array;
              let formattedPlans = {};
              plans.forEach(plan => {
                let plansArray = JSON.parse(plan.plan);
                formattedPlans[plan.date] = plansArray.map(p => ({
                  title: p.title,
                  content: p.content,
                }));
              });
  
              const formatEnd = Date.now();
              console.log("Data formatting time: " + (formatEnd - formatStart) + "ms");
  
              resolve(formattedPlans);
            } else {
              resolve({});
            }
          },
          (_, error) => {
            console.log(`Error fetching data from ${tableName}:`, error);
            reject(error);
          }
        );
      });
    });
  };
  
  
  const getLastPlanDate = () => {
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
            reject(error);
          }
        );
      });
    });
  };
  
  const getLastPlan = async (db, tableName) => {
    const lastPlanDate = await getLastPlanDate(db, tableName);
    if (lastPlanDate) {
      const twoWeeksBefore = new Date(lastPlanDate);
      twoWeeksBefore.setDate(twoWeeksBefore.getDate() - 14);
      
      // Convert twoWeeksBefore to a string in the "YYYY-MM-DD" format
      const twoWeeksBeforeStr = twoWeeksBefore.toISOString().split('T')[0];
      
      const plan = await getPlanFromDb(db, tableName, twoWeeksBeforeStr, lastPlanDate);
      return plan;
    } else {
      return null;
    }
  };
  
  useEffect(() => {
    async function fetchData() {
      try {
        createWorkoutTable();
        createNutritionTable();
    
        const workoutPlan = await getLastPlan(workoutDb, 'workout_plans');
        const nutritionPlan = await getLastPlan(nutritionDb, 'nutrition_plans');
    
        let dataMessage = '';
    
        if (workoutPlan && nutritionPlan) {
          dataMessage = "Here is your current workout and nutrition plans: \n\n" 
                      + "Workout Plan: " + JSON.stringify(workoutPlan) + "\n\n"
                      + "Nutrition Plan: " + JSON.stringify(nutritionPlan);
        } else if (workoutPlan) {
          dataMessage = "Here is your current workout plan: \n\n" 
                      + "Workout Plan: " + JSON.stringify(workoutPlan);
        } else if (nutritionPlan) {
          dataMessage = "Here is your current nutrition plan: \n\n"
                      + "Nutrition Plan: " + JSON.stringify(nutritionPlan);
        } else {
          dataMessage = "You don't have any workout or nutrition plans stored for the last two weeks.";
        }
    
        initialMessage = `${dataMessage}\n\n${initialMessage}`;
        loadMessagesFromStorage();
      } catch (error) {
        console.log(error);
      }
    }
  
    fetchData();
  }, []);
  
  
  

  const loadMessagesFromStorage = async () => {
    const savedMessages = await AsyncStorage.getItem('chatHistory');
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      setMessages(convertToGiftedChatFormat(parsedMessages));
    } else {
      const initialMessages = [
        { role: 'assistant', content: initialBGMessage },
      ];
      setMessages(convertToGiftedChatFormat(initialMessages)); 
      AsyncStorage.setItem('chatHistory', JSON.stringify([ { role: 'system', content: initialMessage }, ...initialMessages]));
    }
  };
  

  const resetChatHistory = async () => {
    const initialMessages = [
      { role: 'assistant', content: initialBGMessage },
    ];
    await AsyncStorage.setItem('chatHistory', JSON.stringify(initialMessages));
  };

  const ResetButton = () => (
    <TouchableOpacity
      style={{
        backgroundColor: '#ff0000',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        margin: 10,
      }}
      onPress={resetChatHistory}
    >
      <Text style={{ color: '#ffffff' }}>Reset Chat</Text>
    </TouchableOpacity>
  );

  const onSend = async (newMessages = []) => {
  const newMessage = {
    role: 'user',
    content: newMessages[0].text,
  };

  setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
  setIsAssistantTyping(true);
  const aiResponse = await getAIResponse(newMessage.content, messages);
  setIsAssistantTyping(false);

  if (aiResponse.content.trim().length > 0) {
    const aiMessage = {
      _id: `${aiResponse.role}-${messages.length + 1}`,
      text: aiResponse.content, // Use the content property from the AI response
      user: {
        _id: aiResponse.role === 'user' ? 1 : 2, // Set the user._id based on the role property from the AI response
        name: aiResponse.role, // Use the role property as the name
      },
    };

    setMessages(previousMessages => {
            const updatedMessages = GiftedChat.append(previousMessages, aiMessage);
      AsyncStorage.setItem('chatHistory', JSON.stringify(convertFromGiftedChatFormat(updatedMessages)));
      return updatedMessages;
    });
  }
};

const getAIResponse = async (userInput, currentMessages) => {
  const messages = convertFromGiftedChatFormat(currentMessages);
  messages.push({ role: 'user', content: userInput });
  messages.push({ role: 'system', content: initialMessage }); // Add the system message here

  console.log('Sending messages:', JSON.stringify({ messages })); // Added logging

  try {
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
    const nutritionStartIndex = data.content.indexOf('!ntst!');
    const nutritionEndIndex = data.content.indexOf('!ntnd!');

    if (workoutStartIndex !== -1 && workoutEndIndex !== -1) {
      data = await handleWorkoutPlans(workoutStartIndex, workoutEndIndex, data);
    }

    if (nutritionStartIndex !== -1 && nutritionEndIndex !== -1) {
      data = await handleNutritionPlans(nutritionStartIndex, nutritionEndIndex, data);
    }

    return data;
  } catch (error) {
    console.error('Error fetching AI response:', error);
    return 'Sorry, I am unable to process your request at this time.';
  }
};

const handleWorkoutPlans = async (startIndex, endIndex, data) => {
  // Extract workout plan
  let workoutPlanStr = data.content.slice(startIndex + 7, endIndex);

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

  // Check if the first date is in the dateList
  if (!dateList.slice(0, 5).includes(firstDateFromPlan)) {
    // Get the first date from the dateList
    const firstDateFromList = dateList[0];
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

  // Clear the workout table first
  workoutDb.transaction(tx => {
    tx.executeSql(
      `DELETE FROM workout_plans;`,
      [],
      (_, resultSet) => {
        console.log('All existing workout plans deleted successfully.');

        // Then, insert the new plans
        Object.keys(workoutPlanObj).forEach(date => {
          let plan = JSON.stringify(workoutPlanObj[date]);

          tx.executeSql(
            `INSERT INTO workout_plans (date, plan) VALUES (?, ?);`,
            [date, plan],
            (_, resultSet) => {
              updateWorkoutData(true),
              console.log('New workout plan saved successfully.');
            },
            (_, error) => {
              console.error(`Error saving workout plan to database:`, error);
            }
          );
        });
      },
      (_, error) => {
        console.error(`Error deleting existing workout plans:`, error);
      }
    );
  });

  // Remove workout plan from AI response message
  data.content = data.content.slice(0, startIndex) + data.content.slice(endIndex + 7);

  return data;
};


const handleNutritionPlans = async (startIndex, endIndex, data) => {
  // Extract nutrition plan
  let nutritionPlanStr = data.content.slice(startIndex + 7, endIndex);

  // Ensure that the extracted string is wrapped in curly braces
  if (!nutritionPlanStr.startsWith('{')) {
    nutritionPlanStr = '{' + nutritionPlanStr;
  }
  if (!nutritionPlanStr.endsWith('}')) {
    nutritionPlanStr = nutritionPlanStr + '}';
  }

  let nutritionPlanObj;
  try {
    nutritionPlanObj = JSON.parse(nutritionPlanStr);
  } catch (error) {
    console.error('Error parsing nutrition plan:', error);
    console.log('Here is the sstring that caused the error:' + nutritionPlanStr)
    return;
  }

  // Get the first date from the nutrition plan
  const firstDateFromPlan = Object.keys(nutritionPlanObj)[0];

  // Check if the first date is in the dateList
  if (!dateList.slice(0, 5).includes(firstDateFromPlan)) {
    // Get the first date from the dateList
    const firstDateFromList = dateList[0];
    // Create a new nutrition plan object with updated dates
    const updatedNutritionPlanObj = {};
    const originalDates = [];
    const newDates = [];
    for (const date in nutritionPlanObj) {
      const dateObj = new Date(date);
      const daysDiff = Math.floor((dateObj - new Date(firstDateFromPlan)) / (1000 * 60 * 60 * 24));
      const newDateObj = new Date(firstDateFromList);
      newDateObj.setDate(newDateObj.getDate() + daysDiff);
      const newDate = newDateObj.toISOString().split('T')[0];
      updatedNutritionPlanObj[newDate] = nutritionPlanObj[date];
      // Store original and new dates for logging
      originalDates.push(date);
      newDates.push(newDate);
    }
    // Update the nutritionPlanObj to be the updatedNutritionPlanObj
    nutritionPlanObj = updatedNutritionPlanObj;

    console.log(`Dates needed to be changed. Changed: ${originalDates} to ${newDates}`);
  }

  // Clear the nutrition table first
  nutritionDb.transaction(tx => {
    tx.executeSql(
      `DELETE FROM nutrition_plans;`,
      [],
      (_, resultSet) => {
        console.log('All existing nutrition plans deleted successfully.');

        // Then, insert the new plans
        Object.keys(nutritionPlanObj).forEach(date => {
          let plan = JSON.stringify(nutritionPlanObj[date]);

          tx.executeSql(
            `INSERT INTO nutrition_plans (date, plan) VALUES (?, ?);`,
            [date, plan],
            (_, resultSet) => {
              updateWorkoutData(true),
              console.log('New nutrition plan saved successfully.');
            },
            (_, error) => {
              console.error(`Error saving nutrition plan to database:`, error);
            }
          );
        });
      },
      (_, error) => {
        console.error(`Error deleting existing nutrition plans:`, error);
      }
    );
  });

  // Remove nutrition plan from AI response message
  data.content = data.content.slice(0, startIndex) + data.content.slice(endIndex + 7);

  return data;
};


  const convertToGiftedChatFormat = (messages) => {
    return messages.map((message, index) => ({
      _id: `${message.role}-${Date.now()}-${index}`,
      text: message.content,
      user: {
        _id: message.role === 'user' ? 1 : 2,
        name: message.role === 'user' ? 'User' : 'Bot',
      },
    }));
  };  
  

  const convertFromGiftedChatFormat = (messages) => {
    return messages.slice().reverse().map(message => ({
      role: message.user._id === 1 ? 'user' : 'assistant',
      content: message.text,
    }));
  };  
  
const [longWait, setLongWait] = React.useState(false);
const typingTimer = React.useRef(null);

React.useEffect(() => {
  if (isAssistantTyping) {
    typingTimer.current = setTimeout(() => {
      setLongWait(true);
    }, 10000);
  } else {
    clearTimeout(typingTimer.current);
    typingTimer.current = null;
    setLongWait(false);
  }
}, [isAssistantTyping]);

return (
  <View style={{ flex: 1 }}>
    <ResetButton />
    <GiftedChat
      messages={messages}
      onSend={newMessages => onSend(newMessages)}
      user={{
        _id: 1,
      }}
      listViewProps={{
        style: {
          backgroundColor: '#ececec',
        },
      }}
      renderAvatar={null}
      renderBubble={props => {
        return (
          <Bubble
            {...props}
            wrapperStyle={{
              left: { backgroundColor: '#ffffff' },
              right: { backgroundColor: '#2f4f4f' },
            }}
            textStyle={{
              left: { color: '#3a3a3a', fontFamily: 'Helvetica'},
              right: { color: '#ffffff', fontFamily: 'Helvetica' },
            }}
          />
        );
      }}
      renderInputToolbar={props => (
        <InputToolbar
          {...props}
          containerStyle={{
            backgroundColor: '#ffffff',
          }}
        />
      )}
      renderSend={props => (
        <Send {...props}>
          <TouchableOpacity
            style={{
              backgroundColor: '#2f4f4f',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
              marginRight: 10,
              marginBottom: 10,
            }}
            onPress={() => {
              props.onSend({ text: props.text.trim() }, true);
            }}
          >
            <Text style={{ color: '#ffffff' }}>Send</Text>
          </TouchableOpacity>
        </Send>
      )}
      isTyping={isAssistantTyping}
      renderFooter={props => {
        if (longWait) {
          return (
            <View style={{ flexDirection: 'row', alignItems: 'center', margin: 10 }}>
              <Text>Plan is generating, this might take a few minutes...</Text>
            </View>
          );
        } else if (isAssistantTyping) {
          return (
            <View style={{ flexDirection: 'row', alignItems: 'center', margin: 10 }}>
              <Text style={{ marginLeft: 10 }}>Assistant is typing...</Text>
            </View>
          );
        }
        return null;
      }}
    />
  </View>
);
}