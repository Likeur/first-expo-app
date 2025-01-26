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
  Modal,
  ActivityIndicator,
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
  registration_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  promotion_id: number;
}

interface Promotion {
  id: number;
  name: string;
}

export default function StudentScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPromotionModalVisible, setIsPromotionModalVisible] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student>({
    registration_number: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    promotion_id: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, promotionsData] = await Promise.all([
        getStudents(),
        getPromotions(),
      ]);
      setStudents(studentsData);
      setPromotions(promotionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromotionSelect = (promotionId: number) => {
    setCurrentStudent({ ...currentStudent, promotion_id: promotionId });
    setIsPromotionModalVisible(false);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s-]{8,}$/;
    return phoneRegex.test(phone.trim());
  };

  const validateForm = () => {
    const requiredFields = {
      'Registration Number': currentStudent.registration_number,
      'First Name': currentStudent.first_name,
      'Last Name': currentStudent.last_name,
      'Email': currentStudent.email,
      'Phone': currentStudent.phone_number,
      'Promotion': currentStudent.promotion_id,
    };

    for (const [fieldName, value] of Object.entries(requiredFields)) {
      if (!value || (typeof value === 'string' && value.trim() === '') || value === 0) {
        Alert.alert('Validation Error', `${fieldName} is required`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      if (!validateEmail(currentStudent.email)) {
        Alert.alert('Validation Error', 'Please enter a valid email address');
        return;
      }

      if (!validatePhone(currentStudent.phone_number)) {
        Alert.alert('Validation Error', 'Please enter a valid phone number');
        return;
      }

      setIsSubmitting(true);

      const studentData = {
        registration_number: currentStudent.registration_number.trim(),
        first_name: currentStudent.first_name.trim(),
        last_name: currentStudent.last_name.trim(),
        email: currentStudent.email.trim().toLowerCase(),
        phone_number: currentStudent.phone_number.trim(),
        promotion_id: currentStudent.promotion_id,
      };

      if (isEditing && currentStudent.id) {
        await updateStudent(
          currentStudent.id,
          studentData.first_name,
          studentData.last_name,
          studentData.email,
          studentData.phone_number,
          studentData.promotion_id,
          studentData.registration_number
        );
      } else {
        await addStudent(
          studentData.first_name,
          studentData.last_name,
          studentData.email,
          studentData.phone_number,
          studentData.promotion_id,
          studentData.registration_number
        );
      }

      await loadData();
      clearForm();
      Alert.alert('Success', `Student ${isEditing ? 'updated' : 'added'} successfully`);
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert(
        'Error',
        `Failed to ${isEditing ? 'update' : 'add'} student. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const student = await getStudentById(id);
      if (student) {
        setCurrentStudent(student);
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error editing student:', error);
      Alert.alert('Error', 'Failed to load student details');
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this student?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStudent(id);
              await loadData();
              Alert.alert('Success', 'Student deleted successfully');
            } catch (error) {
              console.error('Error deleting student:', error);
              Alert.alert('Error', 'Failed to delete student');
            }
          },
        },
      ]
    );
  };

  const clearForm = () => {
    setCurrentStudent({
      registration_number: '',
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      promotion_id: 0,
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SQLiteProvider databaseName="university.db" onInit={migrateDbIfNeeded}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScrollView>
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Registration Number"
              value={currentStudent.registration_number}
              onChangeText={(text) =>
                setCurrentStudent({ ...currentStudent, registration_number: text })
              }
              editable={!isSubmitting}
            />
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={currentStudent.first_name}
              onChangeText={(text) =>
                setCurrentStudent({ ...currentStudent, first_name: text })
              }
              editable={!isSubmitting}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={currentStudent.last_name}
              onChangeText={(text) =>
                setCurrentStudent({ ...currentStudent, last_name: text })
              }
              editable={!isSubmitting}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={currentStudent.email}
              onChangeText={(text) =>
                setCurrentStudent({ ...currentStudent, email: text.toLowerCase() })
              }
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isSubmitting}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={currentStudent.phone_number}
              onChangeText={(text) =>
                setCurrentStudent({ ...currentStudent, phone_number: text })
              }
              keyboardType="phone-pad"
              editable={!isSubmitting}
            />

            <TouchableOpacity
              style={[styles.dropdownButton, isSubmitting && styles.disabledButton]}
              onPress={() => setIsPromotionModalVisible(true)}
              disabled={isSubmitting}
            >
              <Text style={[
                styles.dropdownButtonText,
                currentStudent.promotion_id === 0 && styles.placeholderText
              ]}>
                {currentStudent.promotion_id === 0
                  ? 'Select Promotion'
                  : promotions.find(p => p.id === currentStudent.promotion_id)?.name || 'Select Promotion'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>

            <Modal
              visible={isPromotionModalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setIsPromotionModalVisible(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setIsPromotionModalVisible(false)}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Promotion</Text>
                    <TouchableOpacity
                      onPress={() => setIsPromotionModalVisible(false)}
                    >
                      <MaterialIcons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView>
                    {promotions.map((promotion) => (
                      <TouchableOpacity
                        key={promotion.id}
                        style={[
                          styles.promotionItem,
                          currentStudent.promotion_id === promotion.id && styles.selectedPromotionItem
                        ]}
                        onPress={() => handlePromotionSelect(promotion.id)}
                      >
                        <Text style={[
                          styles.promotionItemText,
                          currentStudent.promotion_id === promotion.id && styles.selectedPromotionText
                        ]}>
                          {promotion.name}
                        </Text>
                        {currentStudent.promotion_id === promotion.id && (
                          <MaterialIcons name="check" size={24} color="#007AFF" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditing ? 'Update' : 'Add'} Student
                </Text>
              )}
            </TouchableOpacity>

            {isEditing && (
              <TouchableOpacity
                style={[styles.cancelButton, isSubmitting && styles.disabledButton]}
                onPress={clearForm}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.listContainer}>
            {students.map((student) => (
              <View key={student.id} style={styles.studentCard}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>
                    {student.first_name} {student.last_name}
                  </Text>
                  <Text>Reg: {student.registration_number}</Text>
                  <Text>Email: {student.email}</Text>
                  <Text>Phone: {student.phone_number}</Text>
                  <Text>Promotion: {
                    promotions.find(p => p.id === student.promotion_id)?.name || 'Unknown'
                  }</Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    onPress={() => student.id && handleEdit(student.id)}
                    disabled={isSubmitting}
                  >
                    <MaterialIcons 
                      name="edit" 
                      size={24} 
                      color={isSubmitting ? '#ccc' : '#007AFF'} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => student.id && handleDelete(student.id)}
                    disabled={isSubmitting}
                  >
                    <MaterialIcons 
                      name="delete" 
                      size={24} 
                      color={isSubmitting ? '#ccc' : '#FF3B30'} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  promotionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedPromotionItem: {
    backgroundColor: '#f0f8ff',
  },
  promotionItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedPromotionText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  listContainer: {
    padding: 16,
  },
  studentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
