import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type ListItemProps = {
  icon: React.ReactNode;
  text: string;
  onPress: () => void;
};

const ListItem = ({ icon, text, onPress }: ListItemProps) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <View style={styles.itemLeft}>
      {icon}
      <Text style={styles.itemText}>{text}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#003366" />
  </TouchableOpacity>
);

import type { NavigationProp } from '@react-navigation/native';
import { router } from 'expo-router';

export default function ReadyToGetOffers({ navigation }: { navigation: NavigationProp<any> }) {
  return (
    <View style={styles.container}>
      {/* Back Arrow Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Ready to get offers?</Text>
      <Text style={styles.subtitle}>Post the task when you're ready</Text>

      <ScrollView contentContainerStyle={styles.list}>
        <ListItem
          icon={<MaterialIcons name="drive-file-rename-outline" size={20} color="#003366" />}
          text="Move the car"
          onPress={() => navigation.navigate('MoveCar')}
        />
        <ListItem
          icon={<MaterialIcons name="event-available" size={20} color="#003366" />}
          text="I'm Flexible"
          onPress={() => navigation.navigate('Flexible')}
        />
        <ListItem
          icon={<Ionicons name="location-outline" size={20} color="#003366" />}
          text="Online"
          onPress={() => navigation.navigate('Online')}
        />
        <ListItem
          icon={<MaterialIcons name="description" size={20} color="#003366" />}
          text="Description"
          onPress={() => navigation.navigate('Description')}
        />
        <ListItem
          icon={<MaterialIcons name="attach-money" size={20} color="#003366" />}
          text="A$200"
          onPress={() => navigation.navigate('Budget')}
        />
      </ScrollView>

      <TouchableOpacity style={styles.continueBtn} onPress={() => router.push('/(tabs)')}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0B1A33',
    marginBottom: 5,
    marginTop: 40,
  },
  subtitle: {
    color: '#667085',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  item: {
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // Increased gap between items
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    color: '#003366',
    marginLeft: 16, // Increased margin to separate icon and text
  },
  continueBtn: {
    backgroundColor: '#0052CC',
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 30,
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontWeight: '600',
  },
});
