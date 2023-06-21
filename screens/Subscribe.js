import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Purchases from 'react-native-purchases';

export default function SubscriptionScreen() {
  const [offerings, setOfferings] = useState(null);

  useEffect(() => {
    fetchOfferings();
  }, []);

  const fetchOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      setOfferings(offerings);
    } catch (error) {
      console.log('Error fetching offerings:', error);
    }
  };

  const handleSubscribeAnnual = async () => {
    try {
      const annualPackage = offerings?.current?.availablePackages.find(
        (pkg) => pkg.identifier === 'annual_subscription_package'
      );
      if (annualPackage) {
        const { purchaserInfo } = await Purchases.purchasePackage(annualPackage);
        console.log('Annual subscription purchased');
      }
    } catch (error) {
      console.log('Error purchasing annual subscription:', error);
    }
  };

  const handleSubscribeMonthly = async () => {
    try {
      const monthlyPackage = offerings?.current?.availablePackages.find(
        (pkg) => pkg.identifier === 'monthly_subscription_package'
      );
      if (monthlyPackage) {
        const { purchaserInfo } = await Purchases.purchasePackage(monthlyPackage);
        console.log('Monthly subscription purchased');
      }
    } catch (error) {
      console.log('Error purchasing monthly subscription:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.image} />
      <Text style={styles.placeholderText}>Select a subscription:</Text>
      {offerings?.current?.availablePackages.map((pkg) => (
        <View key={pkg.identifier} style={styles.box}>
          <Text style={styles.title}>{pkg.product.title}</Text>
          <Text style={styles.price}>
            {pkg.product.priceString} {pkg.product.currencyCode}
          </Text>
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={() => handleSubscribe(pkg.identifier)}
          >
            <Text style={styles.buttonText}>Subscribe</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2f4f4f',
    alignItems: 'center',
    paddingTop: 40,
  },
  image: {
    width: 300,
    height: 300,
  },
  placeholderText: {
    color: '#ffffff',
    fontSize: 18,
    marginBottom: 20,
  },
  box: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    color: '#2f4f4f',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  price: {
    color: '#2f4f4f',
    fontSize: 30,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subscribeButton: {
    backgroundColor: '#ffc65a',
    padding: 10,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#2f4f4f',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

