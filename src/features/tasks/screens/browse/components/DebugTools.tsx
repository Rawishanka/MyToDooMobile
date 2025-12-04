import { CategoriesAPI } from '@/src/api/categories-api';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DebugToolsProps {
  onClearAll: () => void;
  onRefresh: () => void;
}

export default function DebugTools({ onClearAll, onRefresh }: DebugToolsProps) {
  const handleTestCategories = async () => {

    try {
      const result = await CategoriesAPI.getAllCategories();

      alert(`Categories API Test: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {

      alert(`Categories API Test Failed: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={onClearAll}
        style={[styles.button, styles.clearButton]}
      >
        <Text style={styles.buttonText}>Clear All</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={onRefresh}
        style={[styles.button, styles.refreshButton]}
      >
        <Text style={styles.buttonText}>Refresh</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={handleTestCategories}
        style={[styles.button, styles.testButton]}
      >
        <Text style={styles.smallButtonText}>Test Cat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    marginLeft: 4,
    padding: 4,
    borderRadius: 4,
  },
  clearButton: {
    backgroundColor: '#ff6b35',
    marginLeft: 8,
  },
  refreshButton: {
    backgroundColor: '#007bff',
  },
  testButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: 'white',
    fontSize: 10,
  },
  smallButtonText: {
    color: 'white',
    fontSize: 8,
  },
});
