import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Workout from './screens/Workout';
import Nutrition from './screens/Nutrition';
import ChatScreen from './screens/Chat';
import Tracking from './screens/Tracking';
import Settings from './screens/Settings';
import SubscriptionScreen from './screens/Subscribe';
import { WorkoutProvider } from './WorkoutContext';
import { NutritionProvider } from './NutritionContext';
import { ResetProvider } from './ResetChatContext';
import Toast from 'react-native-toast-message';
import { Dimensions } from 'react-native';

// current device dimensions
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');

// iPhone 12 dimensions
const REFERENCE_WIDTH = 390;
const REFERENCE_HEIGHT = 844;

export const getRelativeWidth = (size) => (DEVICE_WIDTH * size) / REFERENCE_WIDTH;
export const getRelativeHeight = (size) => (DEVICE_HEIGHT * size) / REFERENCE_HEIGHT;

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <ResetProvider>
      <WorkoutProvider>
        <NutritionProvider>
          <NavigationContainer>
            <Tab.Navigator
              initialRouteName="Chat"
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
                    backgroundColor: '#2f4f4f',
                    paddingTop: 3,
                  },
                  null,
                ],
              }}
            >
              <Tab.Screen
                name="Workout"
                component={Workout}
                options={{
                  headerTitle: '',
                  headerStatusBarHeight: 0,
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="barbell-outline" size={getRelativeWidth(30)} color={color} />
                  ),
                  tabBarShowLabel: false,
                }}
              />
              <Tab.Screen
                name="Nutrition"
                component={Nutrition}
                options={{
                  headerTitle: '',
                  headerStatusBarHeight: 0,
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="restaurant-outline" size={getRelativeWidth(30)} color={color} />
                  ),
                  tabBarShowLabel: false,
                }}
              />
              <Tab.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                  headerTitle: '',
                  headerStatusBarHeight: 0,
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="chatbox-ellipses-outline" size={getRelativeWidth(30)} color={color} />
                  ),
                  tabBarShowLabel: false,
                }}
              />
              <Tab.Screen
                name="Tracking"
                component={Tracking}
                options={{
                  headerTitle: '',
                  headerStatusBarHeight: 0,
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="bar-chart-outline" size={getRelativeWidth(30)} color={color} />
                  ),
                  tabBarShowLabel: false,
                }}
              />
              <Tab.Screen
                name="Settings"
                component={Settings}
                options={{
                  headerTitle: '',
                  headerStatusBarHeight: 0,
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="settings-outline" size={getRelativeWidth(30)} color={color} />
                  ),
                  tabBarShowLabel: false,
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
  const [subscribed, setSubscribed] = useState(false);

  return (
    <View style={styles.container}>
      {subscribed ? (
        <MyTabs />
      ) : (
        <SubscriptionScreen setSubscribed={setSubscribed} />
      )}
      <Toast />
    </View>
  );
}
