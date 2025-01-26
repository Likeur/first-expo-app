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
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDbIfNeeded } from '@/components/migrations';
import {
  addPromotion,
  getPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  getFaculties,
} from '@/components/crud';

interface Promotion {
  id: number;
  name: string;
  faculty_id: number;
  academic_year: string;
  faculty_name?: string;
}

interface Faculty {
  id: number;
  name: string;
}

const PromotionScreen = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [name, setName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    loadPromotions();
    loadFaculties();
  }, []);

  const loadPromotions = async () => {
    try {
      const data = await getPromotions();
      setPromotions(data);
    } catch (error) {
      console.error('Failed to load promotions:', error);
    }
  };

  const loadFaculties = async () => {
    try {
      const data = await getFaculties();
      setFaculties(data);
    } catch (error) {
      console.error('Failed to load faculties:', error);
    }
  };

  const resetForm = () => {
    setName('');
    setAcademicYear('');
    setFacultyId(null);
    setEditingId(null);
    setIsEditing(false);
    setIsFormVisible(false);
  };

  const handleSubmit = async () => {
    if (!name || !academicYear || !facultyId) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    try {
      if (isEditing && editingId) {
        await updatePromotion(editingId, name, facultyId, academicYear);
      } else {
        await addPromotion(name, facultyId, academicYear);
      }
      
      resetForm();
      await loadPromotions();
    } catch (error) {
      console.error('Operation failed:', error);
      Alert.alert('Error', 'Operation failed');
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const promotion = await getPromotionById(id);
      if (promotion) {
        setName(promotion.name);
        setAcademicYear(promotion.academic_year);
        setFacultyId(promotion.faculty_id);
        setEditingId(id);
        setIsEditing(true);
        setIsFormVisible(true);
      }
    } catch (error) {
      console.error('Failed to load promotion:', error);
      Alert.alert('Error', 'Failed to load promotion');
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this promotion?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePromotion(id);
              await loadPromotions();
            } catch (error) {
              console.error('Failed to delete promotion:', error);
              Alert.alert('Error', 'Failed to delete promotion');
            }
          },
        },
      ]
    );
  };

  return (
    <SQLiteProvider databaseName="university.db" onInit={migrateDbIfNeeded}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Backdrop */}
        {isFormVisible && (
          <TouchableOpacity 
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setIsFormVisible(false)}
          >
            <View style={styles.backdropContent} />
          </TouchableOpacity>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Promotions</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              console.log('Add button pressed');
              setIsFormVisible(true);
              setIsEditing(false);
              setName('');
              setAcademicYear('');
              setFacultyId(null);
            }}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Form Modal */}
        {isFormVisible && (
          <View style={[styles.formContainer, styles.formModal]}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {isEditing ? 'Edit Promotion' : 'New Promotion'}
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
                placeholder="Promotion Name"
                placeholderTextColor="#8E8E93"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Academic Year (e.g., 2023-2024)"
                placeholderTextColor="#8E8E93"
                value={academicYear}
                onChangeText={setAcademicYear}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.labelText}>Select Faculty</Text>
              <ScrollView style={styles.facultySelect}>
                {faculties.map((faculty) => (
                  <TouchableOpacity
                    key={faculty.id}
                    style={[
                      styles.facultyOption,
                      facultyId === faculty.id && styles.facultyOptionSelected
                    ]}
                    onPress={() => setFacultyId(faculty.id)}
                  >
                    <Text style={[
                      styles.facultyOptionText,
                      facultyId === faculty.id && styles.facultyOptionTextSelected
                    ]}>
                      {faculty.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity 
              style={[
                styles.submitButton,
                (!name || !academicYear || !facultyId) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!name || !academicYear || !facultyId}
            >
              <Text style={styles.submitButtonText}>
                {isEditing ? 'Save Changes' : 'Create Promotion'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Promotions List */}
        <ScrollView style={styles.listContainer}>
          {promotions.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="school" size={48} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No promotions available</Text>
              <Text style={styles.emptyStateSubText}>
                Click the + button to add a new promotion
              </Text>
            </View>
          ) : (
            promotions.map((promotion) => (
              <View key={promotion.id} style={styles.promotionItem}>
                <View style={styles.promotionContent}>
                  <Text style={styles.promotionName}>{promotion.name}</Text>
                  <Text style={styles.facultyName}>
                    {promotion.faculty_name}
                  </Text>
                  <Text style={styles.academicYear}>
                    {promotion.academic_year}
                  </Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    onPress={() => handleEdit(promotion.id)}
                    style={styles.actionButton}
                  >
                    <MaterialIcons name="edit" size={22} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDelete(promotion.id)}
                    style={styles.actionButton}
                  >
                    <MaterialIcons name="delete" size={22} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  backdropContent: {
    flex: 1,
  },
  formModal: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
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
  labelText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  facultySelect: {
    maxHeight: 150,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  facultyOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  facultyOptionSelected: {
    backgroundColor: '#517DA2',
  },
  facultyOptionText: {
    fontSize: 16,
    color: '#000',
  },
  facultyOptionTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#517DA2',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#B8B8B8',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#8E8E93',
    marginTop: 16,
    fontWeight: '600',
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  promotionItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  promotionContent: {
    flex: 1,
  },
  promotionName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  facultyName: {
    fontSize: 15,
    color: '#517DA2',
    marginBottom: 4,
  },
  academicYear: {
    fontSize: 14,
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

export default PromotionScreen;
