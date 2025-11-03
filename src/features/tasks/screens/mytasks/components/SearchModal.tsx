import React, { useEffect, useRef } from 'react';
import { Modal, StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native';

interface SearchModalProps {
  visible: boolean;
  searchText: string;
  onClose: () => void;
  onChangeText: (text: string) => void;
}

export default function SearchModal({
  visible,
  searchText,
  onClose,
  onChangeText,
}: SearchModalProps) {
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.container}>
          <View style={styles.content}>
            <TextInput
              ref={searchInputRef}
              style={styles.input}
              placeholder="Search tasks..."
              value={searchText}
              onChangeText={onChangeText}
              autoFocus
              returnKeyType="search"
              onSubmitEditing={onClose}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  content: {
    width: '95%',
    marginTop: 50,
    paddingHorizontal: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
});
