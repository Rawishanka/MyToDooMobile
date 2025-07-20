import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const tags = ['End of lease cleaning', 'Help me move', 'Fix lights', 'Help me move', 'Help me move', 'Help me move', 'Help me move'];
const tasks = [
  { id: '1', name: 'Jane F.', task: 'Folding arm awning needs reset' },
  { id: '2', name: 'Jane F.', task: 'Folding arm awning needs reset' },
  { id: '3', name: 'Jane F.', task: 'Folding arm awning needs reset' },
  { id: '4', name: 'Jane F.', task: 'Folding arm awning needs reset' },
  { id: '5', name: 'Jane F.', task: 'Folding arm awning needs reset' },
  { id: '6', name: 'Jane F.', task: 'Folding arm awning needs reset' },
  { id: '7', name: 'Jane F.', task: 'Folding arm awning needs reset' },
];
type MaterialCommunityIconName =
  | "shovel"
  | "format-paint"
  | "broom"
  | "truck-outline"
  | "clipboard-text-outline"
  | "tools"
  | "file-document-edit-outline"
  | "wrench-outline";

const categories: { title: string; icon: MaterialCommunityIconName }[] = [
  { title: 'Gardening', icon: 'shovel' },
  { title: 'Painting', icon: 'format-paint' },
  { title: 'Cleaning', icon: 'broom' },
  { title: 'Removals', icon: 'truck-outline' },
  { title: 'Data Entry', icon: 'clipboard-text-outline' },
  { title: 'Furniture Assembly', icon: 'tools' },
  { title: 'Copy Writing', icon: 'file-document-edit-outline' },
  { title: 'Repairs & installations', icon: 'wrench-outline' },
];

export default function GetItDoneScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.headerWhite}>
        <Text style={styles.logoBlue}>MyToDoo</Text>
        <MaterialCommunityIcons name="bell-outline" size={24} color="#003399" />
      </View>
      <ScrollView style={{ flex: 1 }}>
        {/* Post a Task Section: blue background, below greeting */}
        <View style={styles.taskCard}>
          <Text style={styles.greetingText}>Good evening. Prasanna</Text>
          <View style={{ height: 28 }} />
          <Text style={styles.postTitle}>Post a Task. Get it Done.</Text>
          <View style={{ height: 24 }} />
          <TextInput
            style={styles.input}
            placeholder="In a few words what do you need done?"
            placeholderTextColor="#999"
          />
          <View style={{ height: 24 }} />
          <TouchableOpacity style={styles.postButton}>
            <MaterialCommunityIcons name="plus" size={18} color="#fff" />
            <Text style={styles.postButtonText}>Post a Task</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>
          <View style={{ height: 18 }} />
          {/* Tags inside blue section */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagRow}
            decelerationRate={0.95}
            snapToAlignment="center"
          >
            {tags.map((tag, index) => (
              <TouchableOpacity key={index} style={styles.tag}>
                <Text style={{ color: '#fff' }}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>


      {/* Task Cards */}
      <Text style={styles.sectionTitle}>Get more work now</Text>
      <Text style={styles.subTitle}>Cut through the competition and earn more with customers you know</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskBox}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.desc}>{item.task}</Text>
            <TouchableOpacity>
              <Text style={styles.messageLink}>💬 Sent a message</Text>
            </TouchableOpacity>
          </View>
        )}
        style={{ marginBottom: 10, paddingHorizontal: 10 }}
        decelerationRate={0.95}
        snapToAlignment="center"
      />

      {/* Category Grid */}
      <Text style={styles.sectionTitle}>Need something done</Text>
      <Text style={styles.subTitle}>Cut through the competition and earn more with customers you know</Text>

      <View style={styles.gridContainer}>
        {categories.map((cat, index) => (
          <TouchableOpacity key={index} style={styles.gridItem}>
            <MaterialCommunityIcons name={cat.icon} size={32} color="#000" />
            <Text style={styles.gridLabel}>{cat.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerWhite: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  logoBlue: { color: '#003399', fontSize: 20, fontWeight: 'bold' },
  greetingSection: {
    backgroundColor: '#003399',
    paddingVertical: 40,
    paddingHorizontal: 16,
    marginBottom: 0,
    justifyContent: 'center',
  },
  greetingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  greeting: { fontSize: 16, margin: 10, color: '#333' },
  taskCard: { backgroundColor: '#003399', paddingHorizontal: 16, paddingVertical: 36 },
  postTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  postButton: {
    flexDirection: 'row',
    backgroundColor: '#001f66',
    padding: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  postButtonText: { color: '#fff', fontWeight: 'bold' },
  tagRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  tag: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    marginTop: 20,
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 14,
    color: '#444',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  taskBox: {
    backgroundColor: '#e8f0fe',
    borderRadius: 12,
    padding: 14,
    marginRight: 10,
    width: 220,
  },
  name: { fontWeight: 'bold', marginBottom: 4 },
  desc: { fontSize: 13, color: '#333' },
  messageLink: { color: '#007bff', marginTop: 6 },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  gridItem: {
    backgroundColor: '#e8f0fe',
    borderRadius: 12,
    width: '48%',
    paddingVertical: 20,
    marginBottom: 12,
    alignItems: 'center',
    marginHorizontal: 0,
  },
  gridLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
