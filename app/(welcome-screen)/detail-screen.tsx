import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { router } from 'expo-router';
import { useCreateTaskStore } from '../../store/create-task-store';

type ListItemProps = {
  icon: React.ReactNode;
  text: string;
  value: string;
  onPress: () => void;
};

const ListItem = ({ icon, text, value, onPress }: ListItemProps) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <View style={styles.itemLeft}>
      {icon}
      <View style={styles.textContainer}>
        <Text style={styles.itemText}>{text}</Text>
        {value && <Text style={styles.valueText}>{value}</Text>}
      </View>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#003366" />
  </TouchableOpacity>
);

export default function DetailScreen() {
  const { myTask } = useCreateTaskStore();

  // Helper function to get location text based on task type
  const getLocationText = () => {
    if ('isRemoval' in myTask && myTask.isRemoval) {
      if (myTask.pickupLocation && myTask.deliveryLocation) {
        return `${myTask.pickupLocation} → ${myTask.deliveryLocation}`;
      }
      return 'Set pickup & delivery locations';
    }
    
    if ('isOnline' in myTask && myTask.isOnline) {
      return 'Online';
    }
    
    if ('inPerson' in myTask && myTask.inPerson && myTask.suburb) {
      return myTask.suburb;
    }
    
    return 'Set location';
  };

  // Helper function to get date/time text
  const getDateTimeText = () => {
    if (myTask.date && myTask.time) {
      return `${myTask.date} at ${myTask.time}`;
    }
    if (myTask.date) {
      return myTask.date;
    }
    return "I'm Flexible";
  };

  return (
    <View style={styles.container}>
      {/* Back Arrow Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Ready to get offers?</Text>
      <Text style={styles.subtitle}>Post the task when you're ready</Text>

      <ScrollView contentContainerStyle={styles.list}>
        <ListItem
          icon={<MaterialIcons name="drive-file-rename-outline" size={20} color="#003366" />}
          text="Task Title"
          value={myTask.title || 'Move the car'}
          onPress={() => router.push('/title-screen')}
        />
        
        <ListItem
          icon={<MaterialIcons name="event-available" size={20} color="#003366" />}
          text="When"
          value={getDateTimeText()}
          onPress={() => router.push('/time-select-screen')}
        />
        
        <ListItem
          icon={<Ionicons name="location-outline" size={20} color="#003366" />}
          text="Location"
          value={getLocationText()}
          onPress={() => router.push('/location-screen')}
        />
        
        <ListItem
          icon={<MaterialIcons name="description" size={20} color="#003366" />}
          text="Description"
          value={myTask.description || 'Add task description'}
          onPress={() => router.push('/description-screen')}
        />
        
        <ListItem
          icon={<MaterialIcons name="attach-money" size={20} color="#003366" />}
          text="Budget"
          value={myTask.budget > 0 ? `A$${myTask.budget}` : 'A$200'}
          onPress={() => router.push('/budget-screen')}
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
    marginBottom: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    color: '#003366',
    fontWeight: '600',
  },
  valueText: {
    fontSize: 14,
    color: '#667085',
    marginTop: 2,
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