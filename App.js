import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Workout from './screens/Workout';
import Nutrition from './screens/Nutrition';
import ChatScreen from './screens/Chat';
import Tracking from './screens/Tracking';
import Settings from './screens/Settings';
import SubscriptionScreen_ft from './screens/Subscribe-ft';
import SubscriptionScreen_nt from './screens/Subscribe-nt';
import { WorkoutProvider } from './WorkoutContext';
import { NutritionProvider } from './NutritionContext';
import { ResetProvider } from './ResetChatContext';
import Toast from 'react-native-toast-message';
import { Dimensions } from 'react-native';
import Purchases from 'react-native-purchases';

// initialize revenuecat
Purchases.configure({ apiKey: "appl_OqeyOUdPheKNZbKgnpddsskShqZ"});

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
                  height:40
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
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [freeTrialAvailable, setFreeTrialAvailable] = useState(false);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      setLoading(true);
      try {
        console.log("Checking subscription status...");
        const customerInfo = await Purchases.getCustomerInfo();
        console.log("Customer Info: ", customerInfo);
        // Check active subscriptions
        if (Object.keys(customerInfo.entitlements.active).length > 0) {
          console.log("User is currently subscribed.");
          setSubscribed(true);
        } else {
          console.log("User is currently not subscribed.");
          const offerings = await Purchases.getOfferings();
          console.log("Offerings: ", offerings);
          if (offerings.current && Object.values(offerings.current.availablePackages).some(pkg => pkg.eligibility === 'ELIGIBLE')) {
            // A free trial is available
            console.log("A free trial is available for the user.");
            setFreeTrialAvailable(true);
          } else if (customerInfo.entitlements.all['your_entitlement_id']) {
            // User has had access to the entitlement before, so they're not eligible for the offer
            // Set free trial to unavailable
            console.log("User has had access to the entitlement before, so they're not eligible for the offer.");
            setFreeTrialAvailable(false);
          } else {
            // User has never had access to any entitlements
            // Show intro offer
            console.log("User has never had access to any entitlements. Showing intro offer.");
            setFreeTrialAvailable(true);
          }
        }
      } catch (error) {
        console.error('Error checking subscription status: ', error);
        // Treat the user as subscribed if network request fails
        setSubscribed(true);
      }
      setLoading(false);
    };
  
    checkSubscriptionStatus();
}, []);


  if (loading) {
    return <View></View>;  // or replace with your loading component
  } else {
    return (
      <View style={{flex:1}}>
        {subscribed ? (
          <MyTabs />
        ) : freeTrialAvailable ? (
          <SubscriptionScreen_ft setSubscribed={setSubscribed} />
        ) : (
          <SubscriptionScreen_nt setSubscribed={setSubscribed} />
        )}
        <Toast />
      </View>
    );
  }
}