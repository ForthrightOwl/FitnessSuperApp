import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import Purchases from 'react-native-purchases';

export default function SubscriptionScreen_ft({ setSubscribed }) {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const getPackages = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
          setPackages(offerings.current.availablePackages);
          console.log(offerings.current.availablePackages); // Log packages
        }
      } catch (e) {
        console.error('Error getting offers', e);
      }
    };

    getPackages();
  }, []);

  const handleSubscribe = async (packageIdentifier) => {
    try {
      const pkg = packages.find((p) => p.identifier === packageIdentifier);
      if (pkg) {
        const { purchaserInfo } = await Purchases.purchasePackage(pkg);
        console.log('Subscription purchased:', packageIdentifier);
        setSubscribed(true);
      }
    } catch (error) {
      console.error('Error purchasing subscription:', error);
    }
  };

  const openURL = (url) => {
    Linking.openURL(url);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.image} />
      <Text style={styles.placeholderText}>Please choose a subscription to proceed:</Text>
      <View style={styles.boxContainer}>
        {packages?.map((pkg) => (
          <View key={pkg.identifier} style={styles.box}>
            <Text style={styles.title}>{pkg.product.title}</Text>
            <Text style={styles.body}>Free for 14 days then:</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{pkg.product.priceString}</Text>
              <Text style={styles.body}>{pkg.product.description}</Text>
            </View>
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={() => handleSubscribe(pkg.identifier)}
            >
              <Text style={styles.buttonText}>Try Free</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <Text style={styles.link} onPress={() => openURL('https://kinergo.app/app-privacypolicy/')}>Privacy Policy</Text>
    </ScrollView>
);
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2f4f4f',
    alignItems: 'center',
    paddingTop: '5%',
    width:'100%',
    paddingBottom:200,
    minHeight:'100%'
  },
  image: {
    height: '35%',
    resizeMode: 'contain', // to make sure the image scales nicely
  },
  placeholderText: {
    color: '#ffffff',
    fontSize: 20,
    marginBottom: '5%',
  },
  boxContainer: {
    width: '86%', // This makes the View take the full width
    flex: 1,
  },
  box: {
    backgroundColor: '#ffffff',
    padding: '3%',
    borderRadius: 10,
    marginBottom:'5%',
    width: '100%',
    alignItems: 'center',
  },
  title: {
    color: '#2f4f4f',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: '3%',
  },
  body: {
    color: '#2f4f4f',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: '3%',
  },
  price: {
    color: '#2f4f4f',
    fontSize: 30,
    marginBottom: '3%',
    fontWeight: 'bold',
  },
  subscribeButton: {
    backgroundColor: '#ffc65a',
    padding: '5%',
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#2f4f4f',
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link:{
    color: '#ffffff',
    fontSize: 20,
    marginBottom: '5%',
  },
});