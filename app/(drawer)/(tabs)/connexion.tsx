import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import * as Network from 'expo-network';

export default function InternetScreen() {
  const [networkState, setNetworkState] = useState({
    type: '',
    isConnected: false,
    details: {
      ipAddress: '',
      subnet: '',
      strength: null,
      ssid: null,
      frequency: null
    }
  });

  useEffect(() => {
    // Initial network state fetch
    const getNetworkInfo = async () => {
      try {
        const [state, ipAddress] = await Promise.all([
          NetInfo.fetch(),
          Network.getIpAddressAsync()
        ]);
        
        updateNetworkState(state, ipAddress);
      } catch (error) {
        console.error('Error fetching network info:', error);
      }
    };

    getNetworkInfo();

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      try {
        const ipAddress = await Network.getIpAddressAsync();
        updateNetworkState(state, ipAddress);
      } catch (error) {
        console.error('Error fetching IP:', error);
        updateNetworkState(state, 'Unknown');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const updateNetworkState = (state: NetInfoState, ipAddress: string) => {
    setNetworkState({
      type: state.type,
      isConnected: state.isConnected || false,
      details: {
        ipAddress: ipAddress || 'Unknown',
        subnet: state.details?.subnet || 'Unknown',
        strength: state.details?.strength || null,
        ssid: state.type === 'wifi' ? state.details?.ssid : null,
        frequency: state.type === 'wifi' ? state.details?.frequency : null
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Information</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Connection Type:</Text>
        <Text style={styles.value}>{networkState.type}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Connected:</Text>
        <Text style={styles.value}>
          {networkState.isConnected ? 'Yes' : 'No'}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>IP Address:</Text>
        <Text style={styles.value}>{networkState.details.ipAddress}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Subnet:</Text>
        <Text style={styles.value}>{networkState.details.subnet}</Text>
      </View>

      {networkState.type === 'wifi' && (
        <>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>WiFi SSID:</Text>
            <Text style={styles.value}>{networkState.details.ssid || 'Unknown'}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>Signal Strength:</Text>
            <Text style={styles.value}>
              {networkState.details.strength ? `${networkState.details.strength}%` : 'Unknown'}
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>Frequency:</Text>
            <Text style={styles.value}>
              {networkState.details.frequency ? `${networkState.details.frequency} MHz` : 'Unknown'}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    flex: 1,
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
  },
});
