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
  addFaculty,
  getFaculties,
  getFacultyById,
  updateFaculty,
  deleteFaculty
} from '@/components/crud';

interface Faculty {
  id: number;
  name: string;
  description: string;
}

const FacultyScreen = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    loadFaculties();
  }, []);

  const loadFaculties = async () => {
    try {
      const data = await getFaculties();
      setFaculties(data);
    } catch (error) {
      console.error('Failed to load faculties:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && editingId) {
        await updateFaculty(editingId, name, description);
      } else {
        await addFaculty(name, description);
      }
      
      setName('');
      setDescription('');
      setEditingId(null);
      setIsEditing(false);
      setIsFormVisible(false);
      await loadFaculties();
    } catch (error) {
      console.error('Operation failed:', error);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const faculty = await getFacultyById(id);
      if (faculty) {
        setName(faculty.name);
        setDescription(faculty.description);
        setEditingId(id);
        setIsEditing(true);
        setIsFormVisible(true);
      }
    } catch (error) {
      console.error('Failed to load faculty:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFaculty(id);
      await loadFaculties();
    } catch (error) {
      console.error('Failed to delete faculty:', error);
    }
  };

  return (
    <SQLiteProvider databaseName="university.db" onInit={migrateDbIfNeeded}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Faculties</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              setIsFormVisible(true);
              setIsEditing(false);
              setName('');
              setDescription('');
            }}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Form Modal */}
        {isFormVisible && (
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {isEditing ? 'Edit Faculty' : 'New Faculty'}
              </Text>
              <TouchableOpacity 
                onPress={() => setIsFormVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Faculty Name"
                placeholderTextColor="#8E8E93"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                placeholderTextColor="#8E8E93"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>
                {isEditing ? 'Save Changes' : 'Create Faculty'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Faculties List */}
        <ScrollView style={styles.listContainer}>
          {faculties.map((faculty) => (
            <View key={faculty.id} style={styles.facultyItem}>
              <View style={styles.facultyContent}>
                <Text style={styles.facultyName}>{faculty.name}</Text>
                <Text style={styles.facultyDescription}>{faculty.description}</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  onPress={() => handleEdit(faculty.id)}
                  style={styles.actionButton}
                >
                  <MaterialIcons name="edit" size={22} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDelete(faculty.id)}
                  style={styles.actionButton}
                >
                  <MaterialIcons name="delete" size={22} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SQLiteProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  header: {
    backgroundColor: '#517DA2',
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#517DA2',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  facultyItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  facultyContent: {
    flex: 1,
  },
  facultyName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  facultyDescription: {
    fontSize: 15,
    color: '#8E8E93',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default FacultyScreen;
