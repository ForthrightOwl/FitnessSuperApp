import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Workout from './screens/Workout';
import Nutrition from './screens/Nutrition';
import ChatScreen from './screens/Chat';
import Tracking from './screens/Tracking';
import Settings from './screens/Settings';
import { WorkoutProvider } from './WorkoutContext'; 
import { NutritionProvider } from './NutritionContext'; 
import { ResetProvider } from './ResetChatContext';
import { initializeApp } from 'firebase/app';
import 'firebase/firestore';

// Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhBPpFS6HWLmI7ihXxAj5bHFwGzs_fGUE",
  authDomain: "bodygenius-9e693.firebaseapp.com",
  projectId: "bodygenius-9e693",
  storageBucket: "bodygenius-9e693.appspot.com",
  messagingSenderId: "368293760442",
  appId: "1:368293760442:web:0a9fba2b91ce94eb316183",
  measurementId: "G-NSWVFRK6N3"
};

const app = initializeApp(firebaseConfig);

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <ResetProvider>
      <WorkoutProvider>
        <NutritionProvider>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={{
                cardStyle: { backgroundColor: '#ffffff' },
                tabBarActiveTintColor: '#ffc65a',
                tabBarInactiveTintColor: '#ffffff',
                tabBarLabelStyle: {
                  fontSize: 14,
                },
                tabBarStyle: [
                  {
                    display: 'flex',
                    backgroundColor:'#2f4f4f',
                    paddingBottom:5

                  },
                  null,
                ],
              }}
            >
              <Tab.Screen
                name="Workout"
                component={Workout}
                options={{
                  headerTitle:"",
                  headerStatusBarHeight:0,
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="barbell-outline" size={30} color={color} />
                  ),
                  tabBarLabel: "",
                }}
              />
              <Tab.Screen
                name="Nutrition"
                component={Nutrition}
                options={{
                  headerTitle:"",
                  headerStatusBarHeight:0,
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="restaurant-outline" size={30} color={color} />
                  ),
                  tabBarLabel: "",
                }}
              />
              <Tab.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                  headerTitle:"",
                  headerStatusBarHeight:0,
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="chatbox-ellipses-outline" size={30} color={color} />
                  ),
                  tabBarLabel: "",
                }}
              />
              <Tab.Screen
                name="Tracking"
                component={Tracking}
                options={{
                  headerTitle:"",
                  headerStatusBarHeight:0,
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="bar-chart-outline" size={30} color={color} />
                  ),
                  tabBarLabel: "",
                }}
              />
              <Tab.Screen
                name="Settings"
                component={Settings}
                options={{
                  headerTitle:"",
                  headerStatusBarHeight:0,
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="settings-outline" size={30} color={color} />
                  ),
                  tabBarLabel: "",
                }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </NutritionProvider>
      </WorkoutProvider>
    </ResetProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default function App() {
  return (

    <View style={styles.container}>
      <MyTabs />
    </View>
  );
}