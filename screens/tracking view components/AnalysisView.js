import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AreaChart, LineChart, BarChart, Grid, XAxis, YAxis, Circle } from 'react-native-svg-charts';
import * as SQLite from 'expo-sqlite';
import * as shape from 'd3-shape';

const db = SQLite.openDatabase('WeightTracker.db');

const formatDate = (date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${day}.${month}`;
};

const AnalysisView = ({ measurements }) => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [rawData, setRawData] = useState([]);

  const fetchAndProcessData = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM measurements ORDER BY date ASC',
        [],
        (_, { rows: { _array } }) => {
          setRawData(_array || []); // Set raw data

          const processData = (data) => {
            const processedData = [];
            let currentWeek = -1;
            let prevSundayWeight = null;
            let nearestPrevMeasurement = null;
            const minimumDataPoints = 6;
          
            data.forEach((item, index) => {
              const date = new Date(item.date);
              const week = Math.floor((date - new Date(date.getFullYear(), 0, 1)) / 604800000);
          
              if (week !== currentWeek) {
                currentWeek = week;
          
                if (nearestPrevMeasurement === null) {
                  nearestPrevMeasurement = item;
                }
          
                const weightChange =
                  prevSundayWeight !== null
                    ? item.weight - prevSundayWeight
                    : 0;
          
                if (Number.isFinite(weightChange)) {
                  processedData.push({ week, date, weight: weightChange });
                }
          
                prevSundayWeight = item.weight;
              }
          
              if (date.getDay() !== 0) {
                nearestPrevMeasurement = item;
              }
            });
          
            const latestWeek = processedData.length > 0 ? processedData[processedData.length - 1].week : 0;
            const startWeek = latestWeek - minimumDataPoints + 1;
          
            for (let week = startWeek; week <= latestWeek; week++) {
              if (!processedData.some((item) => item.week === week)) {
                const date = new Date();
                const previousWeekData = processedData.find((item) => item.week === week - 1);
          
                processedData.push({ week, date, weight: previousWeekData ? previousWeekData.weight : 0 });
              }
            }
          
            processedData.sort((a, b) => a.week - b.week);
          
            return processedData;
          };
          

          const newData = processData(_array);
          setWeeklyData(newData || []);
        },
        (_, error) => {
          console.error('Error fetching data:', error);
        }
      );
    });
  };

  useEffect(() => {
    fetchAndProcessData();
  }, []);

  useEffect(() => {
    fetchAndProcessData();
  }, [measurements]);

  const rawChartData = rawData.map((data) => Number(data.weight));
  const rawChartLabels = rawData.map((data) => formatDate(new Date(data.date)));

  const chartData = weeklyData.slice(-5).map((data) => Number(data.weight));
  const chartLabels = weeklyData.slice(-5).map((data, index) => formatDate(data.date));

  const Label = ({ x, y, index }) => (
    <Text
      x={x(index) + 10}
      y={y(chartData[index]) + (chartData[index] < 0 ? 15 : -5)}
      fontSize={12}
      fill="#ffffff"
      textAnchor="center"
    >
      {chartData[index]}
    </Text>
  );


  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Text style={styles.heading}>Weight</Text>
        <Text style={styles.body}>Track your progress with this line chart that displays your weight changes over time. Monitor your journey and see the positive impact of your efforts as you move closer to your fitness goals.</Text>
        <View style={styles.chartWrapper}>
        <View style={{ flexDirection: 'row', height: '80%' }}>
          <YAxis
            data={rawChartData}
            contentInset={{ top: 10, bottom: 10 }}
            svg={{ fontSize: 10, fill: 'grey' }}
          />
          <View style={{ flex: 1 }}>
            <AreaChart
              style={{ flex: 1 }}
              data={rawChartData}
              svg={{ fill: 'rgba(47, 79, 79, 0.2)' }}
              contentInset={{ top: 10, bottom: 10 }}
              curve={shape.curveNatural}
            >
              <Grid />
            </AreaChart>
            <LineChart
              style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
              data={rawChartData}
              svg={{ stroke: 'rgb(47, 79, 79)', strokeWidth: 2 }}
              contentInset={{ top: 10, bottom: 10 }}
              curve={shape.curveNatural}
            >
              <Grid />
            </LineChart>
          </View>
          <XAxis
            style={{ position: 'absolute', bottom: -20, left: 0, right: 0 }}
            data={rawChartData}
            formatLabel={(value, index) => rawChartLabels[index]}
            contentInset={{ left: 10, right: 10 }}
            svg={{ fontSize: 10, fill: 'grey' }}
          />
        </View>
        </View>
      </View>
      <View style={styles.chartContainer}>
        <Text style={styles.body}>Stay motivated and keep an eye on your progress with this bar chart showcasing week-to-week weight changes. Easily visualize your achievements and identify patterns that can help you make informed adjustments to your fitness routine.</Text>
        <View style={styles.chartWrapper}>
          {/* Weekly Data Chart */}
          <View style={{ flexDirection: 'row', height: '80%' }}>
            <BarChart
              style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
              data={chartData}
              svg={{
                fill: 'rgb(47, 79, 79)',
                borderRadius: 10,
              }}
              contentInset={{ top: 10, bottom: 10 }}
              spacingInner={0.5}
            >
              <Grid />
              {chartData.map((value, index) => (
                <Label key={index} x={(_, index) => x(index)} y={(value) => y(value)} value={value} />
              ))}
            </BarChart>
            <XAxis
              style={{ position: 'absolute', bottom: -20, left: 0, right: 0 }}
              data={chartData}
              formatLabel={(value, index) => chartLabels[index]}
              contentInset={{ left: 30, right: 30 }}
              svg={{ fontSize: 12, fill: 'grey' }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};  


const styles = StyleSheet.create({
container: {
  marginTop: 15,
  marginLeft: 10,
  marginRight: 10,
  marginBottom:10,
  borderRadius: 10,
  backgroundColor: '#ffffff',
},
chartContainer: {
  backgroundColor: '#2f4f4f',
  padding: 15,
  borderRadius: 10,
  overflow: 'hidden',
  marginBottom:15
},
chartWrapper: {
  backgroundColor: '#ffffff',
  borderRadius: 10,
  overflow: 'hidden',
  justifyContent: 'center',
  aspectRatio : 1,
  padding: 15,
},
heading: {
  fontSize: 24,
  fontWeight: 'bold',
  textAlign: 'center',
  color: '#ffffff',
  marginTop: 10,
  fontFamily: 'Helvetica'
},
body: {
  fontSize: 16,
  textAlign: 'left',
  color: '#ffffff',
  marginTop: 10,
  marginBottom:10,
  fontFamily: 'Helvetica'
},
});

export default AnalysisView;