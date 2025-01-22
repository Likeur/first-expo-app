import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function AudioRecording() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [savedFilePath, setSavedFilePath] = useState<string | null>(null);
  const [permissionResponse, setPermissionResponse] = useState<boolean>(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Request audio permissions when component mounts
    const getPermission = async () => {
      try {
        const permission = await Audio.requestPermissionsAsync();
        setPermissionResponse(permission.granted);

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: true,
        });
      } catch (err) {
        console.error('Failed to get audio permission:', err);
        alert('Failed to get audio permission. Please enable microphone access in your device settings.');
      }
    };

    getPermission();
    return () => {
      // Cleanup function to unload sound when component unmounts
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      if (!permissionResponse) {
        alert('Please grant microphone permission to record audio.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          console.log('Recording status:', status);
        },
        100
      );
      
      setRecording(recording);
      setIsRecording(true);
      setSavedFilePath(null);
      setRecordingUri(null);
      setSound(null); // Reset sound when starting new recording
      
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setIsRecording(false);
      setRecording(null);

      if (uri) {
        const fileName = `recording-${Date.now()}.m4a`;
        const newUri = FileSystem.documentDirectory + fileName;
        await FileSystem.moveAsync({
          from: uri,
          to: newUri,
        });
        setSavedFilePath(newUri);
        console.log('Recording saved at:', newUri);
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
      alert('Failed to stop recording. Please try again.');
    }
  };

  const playRecording = async () => {
    try {
      if (isPlaying) {
        // If already playing, stop playback
        if (sound) {
          await sound.stopAsync();
          setIsPlaying(false);
        }
        return;
      }

      if (!savedFilePath) {
        alert('No recording to play');
        return;
      }

      // Configure audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      // Load and play the sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: savedFilePath },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to play recording:', err);
      alert('Failed to play recording. Please try again.');
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.didJustFinish) {
      // Recording finished playing
      setIsPlaying(false);
    }
  };

  const saveToFiles = async () => {
    try {
      if (!savedFilePath) {
        console.error('No recording to save');
        return;
      }

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) {
        alert('Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(savedFilePath, {
        mimeType: 'audio/m4a',
        dialogTitle: 'Save Audio Recording',
        UTI: 'public.audio'
      });
      
    } catch (err) {
      console.error('Error saving file:', err);
      alert('Failed to save the recording. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Recorder</Text>
      
      <View style={styles.buttonContainer}>
        {!isRecording ? (
          <Button 
            title="Start Recording" 
            onPress={startRecording}
            color="#4CAF50"
            disabled={!permissionResponse}
          />
        ) : (
          <Button 
            title="Stop Recording" 
            onPress={stopRecording}
            color="#f44336"
          />
        )}
      </View>

      <Text style={styles.status}>
        {!permissionResponse ? 'Microphone permission needed' :
         isRecording ? 'Recording in progress...' : 'Not recording'}
      </Text>
      
      {savedFilePath && !isRecording && (
        <View style={styles.actionButtonsContainer}>
          <View style={styles.actionButton}>
            <Button
              title={isPlaying ? "Stop Playing" : "Play Recording"}
              onPress={playRecording}
              color="#FF9800"
            />
          </View>
          <View style={styles.actionButton}>
            <Button
              title="Save to Files"
              onPress={saveToFiles}
              color="#2196F3"
            />
          </View>
        </View>
      )}

      {recordingUri && (
        <Text style={styles.savedText}>
          Last recording saved successfully!
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  buttonContainer: {
    marginVertical: 20,
  },
  actionButtonsContainer: {
    marginTop: 20,
    width: '80%',
  },
  actionButton: {
    marginVertical: 5,
  },
  status: {
    marginTop: 20,
    fontSize: 16,
  },
  savedText: {
    marginTop: 10,
    color: 'green',
    fontSize: 16,
  },
});
