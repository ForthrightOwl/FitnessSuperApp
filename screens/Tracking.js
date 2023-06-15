import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions, ScrollView } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import AnalysisView from './tracking view components/AnalysisView';
import InputView from './tracking view components/InputView';
import * as SQLite from 'expo-sqlite';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height * 2;
const db = SQLite.openDatabase('WeightTracker.db');

const Tracking = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [measurements, setMeasurements] = useState([]);

  const handleAddMeasurement = (measurement) => {
    setMeasurements([...measurements, measurement]);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, minHeight: screenHeight}}>
      <View style={styles.container}>
        <TabView
          navigationState={{
            index: selectedIndex,
            routes: [
              { key: 'analysis', title: 'Analysis' },
              { key: 'input', title: 'Input' },
            ],
          }}
          renderScene={({ route }) => {
            switch (route.key) {
              case 'analysis':
                return <AnalysisView measurements={measurements} />;
              case 'input':
                return <InputView onAddMeasurement={handleAddMeasurement} />;
              default:
                return null;
            }
          }}
          onIndexChange={setSelectedIndex}
          initialLayout={{ width: '100%' }}
          renderTabBar={(props) => (
            <TabBar
              {...props}
              style={styles.tabBar}
              labelStyle={styles.tabLabel}
              indicatorStyle={styles.tabIndicator}
              renderLabel={({ route, focused }) => (
                <View style={styles.tabItem}>
                  <Text
                    style={[
                      styles.tabLabel,
                      focused ? styles.activeTabLabel : styles.inactiveTabLabel,
                    ]}
                  >
                    {route.title}
                  </Text>
                </View>
              )}
            />
          )}
        />
      </View>
    </ScrollView>
  );
};  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    marginTop: 16,
    textAlign: 'center',
    fontFamily: 'Helvetica',
  },
  tabBar: {
    backgroundColor: '#d6d6d6',
    borderRadius: 10,
    paddingHorizontal: 10,
    width: screenWidth - 20,
    alignSelf: 'center',
    marginTop:10,
  },
  tabLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'Roboto',
    fontSize: 17,
  },
  activeTabLabel: {
    color: '#ffffff',
  },
  inactiveTabLabel: {
    color: '#3a3a3a',
  },
  tabIndicator: {
    backgroundColor: '#2f4f4f',
    height: '100%',
    borderRadius: 10,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Tracking;