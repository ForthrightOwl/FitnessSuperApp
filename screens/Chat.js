import React, { useState, useContext, useEffect } from 'react';
import { GiftedChat, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import { TouchableOpacity, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { WorkoutContext } from '../WorkoutContext';
import { NutritionContext } from '../NutritionContext';
import { useFocusEffect } from '@react-navigation/native';
import { ResetChatContext } from '../ResetChatContext';
import { logEvent } from '../firebaseConfig'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  let endDate = new Date();
  console.log('Date list initialized successfully. Start date:' + startDate + 'End date:' + endDate)

  // If today is not Monday, adjust startDate to the next Monday
  if (startDate.getDay() !== 1) {
    const daysUntilNextMonday = ((7 - startDate.getDay()) % 7 + 1) % 7;
    startDate.setDate(startDate.getDate() + daysUntilNextMonday);
  }
  console.log('Start date adjusted:' + startDate)

  endDate = new Date(startDate.getTime());
  endDate.setDate(startDate.getDate() + 14); // Add 2 weeks (14 days) to the current date (start from Monday)
  console.log('End date set successfully' + endDate)

  const dateList = [];

  for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
    dateList.push(formatDate(new Date(currentDate)));
  }
  console.log('Successful date list generation: ' + dateList)

  return dateList;
};


const dateList = generateDateList();

let initialMessage = `You are Kinergo, a friendly and supportive personal fitness trainer.

Your objective is to help your client achieve their fitness goals by creating professional and diverse non repetitive workouts or nutritional meal plans, and by being a useful resource to answer any fitness related questions. Ask a lot of questions to understand your client and personalize your advice to them. Always ensure you have information regarding your client’s gender, age, experience, goals, schedule preferences and other similar important factors before giving advice. Listen to your clients and tailor your responses to their wishes.

Always write workout plans in the following format: always begin with a token !wkst! and end with a token !wknd! , specify the plan in JSON format with stringified date as the key and an array containing objects with title and content properties as content. Here is an example: !wkst!{“YYYY-MM-DD”: [{“title": title for the section, "content": workout specifics}], … rest of the dates}!wknd!, for each of the following dates:${dateList}. Tell the user to see the workout plan in the workouts tab. Never provide plans longer than two weeks!
When specifying nutrition or meal plans always begin with a token !ntst! and end with a token !ntnd! , specify the plan in JSON format with stringified date as the key and an array containing objects with title and content properties as content. Here is an example: !ntst!{“YYYY-MM-DD”: [{“title": meal name, "content": meal specifics}], … rest of the dates}!ntnd!, for each of the following dates:${dateList}. Tell the user to see the nutrition plan in the nutrition tab. Never provide plans longer than two weeks!
This format is necessary for the user to save it into an agenda so make sure you follow it exactly ALWAYS! Wrap the whole plan in the designated start and end token, not individual parts.
There is a progress tracking screen, so if the client asks about tracking their progress redirect them there.

Provide plentiful detail in workout and nutrition plans. Always encourage your client to exercise their own judgement in regards to their health. When giving exercise form advice, always provide a link to an instructional video. Never give them both plans at once.`
const initialBGMessage = `Hey there! I'm Kinergo, your personal fitness super assistant. How can I help you achieve your fitness goals today?`



export default function ChatScreen() {
  const { resetChat, setResetChat } = useContext(ResetChatContext);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState(Date.now());

  useFocusEffect(
    React.useCallback(() => {
      const twoHours = 2 * 60 * 60 * 1000; // Time in milliseconds
      if (Date.now() - lastMessageTimestamp > twoHours) {
        resetChatHistory();
      }
      if (resetChat) {
        resetChatHistory();
        setResetChat(false);
      }
    }, [resetChat])
  );

  const [messages, setMessages] = useState([]);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  const { updateWorkoutData } = useContext(WorkoutContext);
  const { updateNutritionData } = useContext(NutritionContext);

  const getPlanFromDb = async (db, tableName, startOfWeek, endOfWeek) => {
    return new Promise((resolve, reject) => {
  
      const query = `SELECT * FROM ${tableName} WHERE date >= ? AND date <= ?`;
  
      db.transaction((tx) => {
        tx.executeSql(
          query,
          [startOfWeek, endOfWeek],
          (_, { rows }) => {
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
      twoWeeksBefore.setDate(twoWeeksBefore.getDate() - 4);
      
      // Convert twoWeeksBefore to a string in the "YYYY-MM-DD" format
      const twoWeeksBeforeStr = twoWeeksBefore.toISOString().split('T')[0];
      
      const plan = await getPlanFromDb(db, tableName, twoWeeksBeforeStr, lastPlanDate);
      return plan;
    } else {
      return null;
    }
  };
  
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          createWorkoutTable();
          createNutritionTable();

          let workoutPlan = await getLastPlan(workoutDb, 'workout_plans');
          let nutritionPlan = await getLastPlan(nutritionDb, 'nutrition_plans');

          // Treat empty strings as false
          workoutPlan = typeof workoutPlan === 'string' && workoutPlan.trim() !== "" ? workoutPlan : null;
          nutritionPlan = typeof nutritionPlan === 'string' && nutritionPlan.trim() !== "" ? nutritionPlan : null;
          
          let dataMessage = '';

          if (workoutPlan && nutritionPlan) {
            dataMessage = "Client's current workout plan: " + JSON.stringify(workoutPlan) + "\n"
                        + "Client's current nutrition plan: " + JSON.stringify(nutritionPlan);
          } else if (workoutPlan) {
            dataMessage = "Client's current workout plan: " + JSON.stringify(workoutPlan);
          } else if (nutritionPlan) {
            dataMessage = "Client's current nutrition plan: " + JSON.stringify(nutritionPlan);
          } else {
            dataMessage = "";
          }
          
          mainMessage = `${dataMessage}\n\n${initialMessage}`;
          loadMessagesFromStorage();
        } catch (error) {
          console.log("Here comes the error:" + error);
        }
      }

      fetchData();
      return () => {
        // any cleanup tasks go here
      };
    }, [])
  );
  

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
      AsyncStorage.setItem('chatHistory', JSON.stringify(initialMessages));
    }
  };
  

  const resetChatHistory = async () => {
    const initialMessages = [
      { role: 'assistant', content: initialBGMessage },
    ];
    await AsyncStorage.setItem('chatHistory', JSON.stringify(initialMessages));
    setMessages(convertToGiftedChatFormat(initialMessages)); // Reset the state
  };

  const onSend = async (newMessages = []) => {
    const newMessage = {
      role: 'user',
      content: newMessages[0].text,
    };
    setLastMessageTimestamp(Date.now());
  
    // Save user message immediately.
    setMessages(previousMessages => {
      const updatedMessages = GiftedChat.append(previousMessages, newMessages);
      AsyncStorage.setItem('chatHistory', JSON.stringify(convertFromGiftedChatFormat(updatedMessages)));
      return updatedMessages;
    });
  
    setIsAssistantTyping(true);
  
    try {
      const aiResponse = await getAIResponse(newMessage.content, messages);
      setIsAssistantTyping(false);
  
      if (aiResponse.content.trim().length > 0) {
        const aiMessage = {
          _id: `${aiResponse.role}-${messages.length + 1}`,
          text: aiResponse.content,
          user: {
            _id: aiResponse.role === 'user' ? 1 : 2,
            name: aiResponse.role,
          },
        };

        // Save AI response.
        setMessages(previousMessages => {
          const updatedMessages = GiftedChat.append(previousMessages, aiMessage);
          AsyncStorage.setItem('chatHistory', JSON.stringify(convertFromGiftedChatFormat(updatedMessages)));
          return updatedMessages;
        });
      }
    } catch (error) {
      console.log("Error getting AI response: ", error);
    }
  };  


 const getAIResponse = async (userInput, currentMessages) => {
    const messages = convertFromGiftedChatFormat(currentMessages).reverse();
    messages.push({ role: 'user', content: userInput });
    messages.push({ role: 'system', content: mainMessage }); 
    console.log('Sending messages:', JSON.stringify({ messages }));
    logEvent('Message_sent_to_the_API')
  
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
        if (errorText === "upstream request timeout") {
          logEvent('API_failed_upstream_request_timeout')
          return 'Oops! We apologize for the inconvenience. Our servers are currently experiencing high traffic, making it difficult to process your request. Please reset your chat history in the settings and try again later. We appreciate your patience and look forward to assisting you soon. Keep up the great work on your fitness journey!';
        } else {
          let err = (`API_failed_${errorText}`);
          err = err.replace(/ /g, '_');
          err = err.slice(0, 40)
          logEvent(err)
        }
      }
      
      function getAllTokens(content, startTag, endTag) {
        let tokens = [];
        let start = content.indexOf(startTag);
        while (start !== -1) {
          let end = content.indexOf(endTag, start);
          if (end === -1) {
            break;
          }
          tokens.push({start, end});
          start = content.indexOf(startTag, end);
        }
        return tokens;
      }
      
      async function deleteAllWorkoutPlans() {
        return new Promise((resolve, reject) => {
          workoutDb.transaction(tx => {
            tx.executeSql(
              `DELETE FROM workout_plans;`,
              [],
              (_, resultSet) => {
                console.log('All existing workout plans deleted successfully.');
                resolve();
              },
              (_, error) => {
                console.log(`Error deleting existing workout plans:`, error);
                reject();
              }
            );
          });
        });
      }
      
      async function deleteAllNutritionPlans() {
        return new Promise((resolve, reject) => {
          nutritionDb.transaction(tx => {
            tx.executeSql(
              `DELETE FROM nutrition_plans;`,
              [],
              (_, resultSet) => {
                console.log('All existing nutrition plans deleted successfully.');
                resolve();
              },
              (_, error) => {
                console.log(`Error deleting existing nutrition plans:`, error);
                reject();
              }
            );
          });
        });
      }

      let data = await response.json();

      let workoutTokens = getAllTokens(data.content, '!wkst!', '!wknd!');
      let nutritionTokens = getAllTokens(data.content, '!ntst!', '!ntnd!');

      if (workoutTokens.length > 0) {
        // Delete all workout plans before handling new ones
        await deleteAllWorkoutPlans();
      }

      if (nutritionTokens.length > 0) {
        // Delete all nutrition plans before handling new ones
        await deleteAllNutritionPlans();
      }
  
      try {
        let workoutResults = [];
        for (let {start, end} of workoutTokens) {
          workoutResults.push(await handleWorkoutPlans(start, end, JSON.parse(JSON.stringify(data))));
        }

        let nutritionResults = [];
        for (let {start, end} of nutritionTokens) {
          nutritionResults.push(await handleNutritionPlans(start, end, JSON.parse(JSON.stringify(data))));
        }

        // Remove processed plans from the content
        let indicesToRemove = workoutTokens.concat(nutritionTokens);
        indicesToRemove.sort((a, b) => b.start - a.start);  // Reverse sort to prevent index shifting

        for (let {start, end} of indicesToRemove) {
          let planType = data.content.slice(start, start + 6) === '!wkst!' ? 'workout' : 'nutrition';
          let placeholder = `\nThe ${planType} plan has been added to your agenda in the ${planType} tab. \n`;
          data.content = data.content.slice(0, start) + placeholder + data.content.slice(end + 7);
        }

        // Reduce newlines to at most two in a row
        data.content = data.content.replace(/\n{3,}/g, '\n\n');
        data.content = data.content.replace(":", ".");
        return data;
  
      } catch (error) {
        console.log('Error processing incomplete message:', error);
        return {
          content: 'Unfortunately, we are not able to process your request right now. Please reset the chat in settings and try again. We apologize for the inconvenience.',
        };
      }
    } catch (error) {
      console.log('Error fetching AI response:', error);
      return {
        content: 'Oops! We encountered an issue while contacting our servers. Please check your network connection and try again. We apologize for any inconvenience caused and appreciate your understanding.',
      };
    }
  };
  
  
  
  const handleWorkoutPlans = async (startIndex, endIndex, data) => {
    // Extract workout plan
    let workoutPlanStr = data.content.slice(startIndex + 7, endIndex).trim();
    console.log(workoutPlanStr)
    logEvent('Workout_plan_extraction_attempted')
  
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
      let err = ('Error_parsing_workout_', error);
      err = err.replace(/ /g, '_');
      err = err.slice(0, 40)
      logEvent(err)
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
        console.log(date);
        const dateObj = new Date(date);
        console.log('Date succesfully created.')
        console.log(dateObj)
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
    }
    workoutDb.transaction(tx => {
      // Insert the new plans
      Object.keys(workoutPlanObj).forEach(date => {
        let plan = JSON.stringify(workoutPlanObj[date]);
    
        tx.executeSql(
          `INSERT INTO workout_plans (date, plan) VALUES (?, ?);`,
          [date, plan],
          (_, resultSet) => {
            updateWorkoutData(true);
          },
          (_, error) => {
            let err = (`Error_saving_workout_`, error);
            err = err.replace(/ /g, '_');
            err = err.slice(0, 40)
            logEvent(err)
          }
        );
      });
    });
    
  
    return data;
  };
  
  
  const handleNutritionPlans = async (startIndex, endIndex, data) => {
    logEvent('Nutrition_plan_extraction_attempted')
    // Extract nutrition plan
    let nutritionPlanStr = data.content.slice(startIndex + 7, endIndex).trim();
    // Ensure that the extracted string is wrapped in curly braces
    if (!nutritionPlanStr.startsWith('{')) {
      nutritionPlanStr = '{' + nutritionPlanStr;
    }
    if (!nutritionPlanStr.endsWith('}')) {
      nutritionPlanStr = nutritionPlanStr + '}';
    }
  
    // Remove trailing commas and comments
    nutritionPlanStr = nutritionPlanStr.replace(/,\s*([}\]])/g, "$1");
    nutritionPlanStr = nutritionPlanStr.replace(/\/\/.*|\/\*[^]*?\*\//g, "");
  
    let nutritionPlanObj;
    try {
      nutritionPlanObj = JSON.parse(nutritionPlanStr);
    } catch (error) {
      let err = ('Error_parsing_nutrition_', error);
      err = err.replace(/ /g, '_');
      err = err.slice(0, 40)
      logEvent(err)
      return {
        content: "I'm sorry, but we are unable to process your request at this time. Please reset the chat in settings and try again later."
      };
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
    }
  
    nutritionDb.transaction(tx => {
      // Insert the new plans
      Object.keys(nutritionPlanObj).forEach(date => {
        let plan = JSON.stringify(nutritionPlanObj[date]);
    
        tx.executeSql(
          `INSERT INTO nutrition_plans (date, plan) VALUES (?, ?);`,
          [date, plan],
          (_, resultSet) => {
            updateNutritionData(true);
            console.log('New nutrition plan saved successfully.');
          },
          (_, error) => {
            let err = (`Error_saving_nutrition_`, error);
            err = err.replace(/ /g, '_');
            err = err.slice(0, 40)
            logEvent(err)
          }
        );
      });
    });
    
  
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
    return messages.slice().map(message => ({
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

// Inside your component
const [typingDots, setTypingDots] = useState('.');
useEffect(() => {
  if (isAssistantTyping) {
    const typingInterval = setInterval(() => {
      setTypingDots(dots => {
        if (dots.length < 3) {
          return dots + '.';
        } else {
          return '.';
        }
      });
    }, 700);
    
    return () => {
      clearInterval(typingInterval);
    };
  }
}, [isAssistantTyping]);

const insets = useSafeAreaInsets();


return (
  <View style={{ flex: 1 }}>
    <GiftedChat
      bottomOffset={insets.bottom + 40}
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
              <Text>Plan is generating, this might take a few minutes{typingDots}</Text>
            </View>
          );
        } else if (isAssistantTyping) {
          return (
            <View style={{ flexDirection: 'row', alignItems: 'center', margin: 10 }}>
              <Text style={{ marginLeft: 10 }}>Assistant is typing{typingDots}</Text>
            </View>
          );
        }
        return null;
      }}
    />
  </View>
);
}