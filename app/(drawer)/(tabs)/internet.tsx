import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const InternetStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    // Initial check
    checkConnection();

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const checkConnection = async () => {
    const networkState = await NetInfo.fetch();
    setIsConnected(networkState.isConnected);
    setConnectionType(networkState.type);
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.statusIndicator,
        { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }
      ]} />
      <Text style={styles.statusText}>
        {isConnected 
          ? `Connected (${connectionType})`
          : 'No Internet Connection'
        }
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent : 'center',
    padding: 16,
    height: 100
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
  },
});

export default InternetStatus;
