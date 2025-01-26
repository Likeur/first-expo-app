## My First expo application

### What It Does
This is a mobile application built using Expo and React Native that use some expo packages such us expo-camera, expo-media-library, expo-audio, expo-location, react-community/netinfo, expo-contact and others to render it in different screen accross the application.

- NB: This is an academic project as we create it with the professor help

### Key Features
- Camera feature : 
    - if permission to access the camera is granted, the app will take pictures and store it to your files and galery
    - You can flip between front and back camera when needed

- Record feature : 
    - if permission to access the recorder is granted, the app has a button to start recording your voice and stop recording, once you finish recording, the app give you the possibility to playback your recording before save it to the local file

- Contact feature : 
    - if permission to access your contact is granted, the app will display all your contacts information in a list: 
        - Key feature of this : 
            
            * Displaying contact sorted from A to Z
            * Search fonctionnality by name
            * Add contact fonctionnality
            * Delete contact 
- Location feature : 
    - if permission to access your location is grantend , the app shows you in the map your actual position with more precisions and it display also your longitude and latitude exactly

- Connexion feature : 
    - the app show your actual connexion status and which connexion you use whether is cellular or wifi
    - it show your public ip

- Database with SQLite feature : 
    - Connected with the local SQLite database, the app display a great screen for doing crud operation with Facultie. but soon i'll add the ability for other stuff also


### Technologies Used
- Expo
- React Native
- Style with native css

### Prerequisites
Before you begin, ensure you have the following installed:
- Node.js (version 12 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (android or Ios)

### Getting Started

* Clone the repository

```bash
git clone https://github.com/Likeur/first-expo-app.git
```

* navigate to the actual project directory

```bash
cd first-expo-app
```

* install dependencies

```bash
npm install
```


* start the development server with

```bash
npx expo start
```




import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDbIfNeeded } from '@/components/migrations';
import {
  addStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getPromotions,
} from '@/components/crud';


import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDbIfNeeded } from '@/components/migrations';
import {
  addStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getPromotions,
} from '@/components/crud';

interface Student {
  id?: number;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  promotionId: number;
}
