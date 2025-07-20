import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const messages = [
  {
    id: '1',
    title: 'Folding arm awning needs reset',
    preview: 'Me: Thanks Jane, I will contact Drago.',
    date: '9 Jan 2025',
  },
  {
    id: '2',
    title: 'Looking for someone who could maintain the garden in weekly basis',
    preview: 'Me: Thanks Jane, I will contact Drago.',
    date: '9 Jan 2025',
  },
  {
    id: '3',
    title: 'Folding arm awning needs reset',
    preview: 'Me: Thanks Jane, I will contact Drago.',
    date: '9 Jan 2025',
  },
  {
    id: '4',
    title: 'Looking for someone who could maintain the garden in weekly basis',
    preview: 'Me: Thanks Jane, I will contact Drago.',
    date: '9 Jan 2025',
  },
];

export default function PrivateMessagesScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.headerText}>Private messages</Text>
        </View>
        <Ionicons name="notifications-outline" size={20} color="#000" />
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="search"
          placeholderTextColor="#ccc"
        />
      </View>

      {/* Message List */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.messageItem}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} // 👈 Replace with actual path
              style={styles.avatar}
            />
            <View style={styles.messageContent}>
              <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
              <Text numberOfLines={1} style={styles.preview}>{item.preview}</Text>
            </View>
            <Text style={styles.date}>{item.date}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '500',
  },
  searchWrapper: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 2,
    marginBottom: 16,
  },
  searchInput: {
    fontSize: 15,
    color: '#333',
    paddingVertical: 4,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  preview: {
    fontSize: 13,
    color: '#777',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
});
