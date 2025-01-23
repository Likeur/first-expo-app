import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Platform, Alert } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export default function LocalisationScreen() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // Request permission to access location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        // Get current location
        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy,
        });
      } catch (error) {
        setErrorMsg('Error getting location');
      }
    })();
  }, []);

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Loading location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="Your Location"
          description="You are here"
        />
      </MapView>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Latitude: {location.latitude.toFixed(6)}
        </Text>
        <Text style={styles.infoText}>
          Longitude: {location.longitude.toFixed(6)}
        </Text>
        {location.accuracy && (
          <Text style={styles.infoText}>
            Accuracy: ±{location.accuracy.toFixed(2)}m
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 0.7,
    width: '100%',
  },
  infoContainer: {
    flex: 0.3,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
