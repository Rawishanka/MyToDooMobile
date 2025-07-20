import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons, Feather, Entypo } from '@expo/vector-icons';

export default function AccountScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>Prasanna J.</Text>
        <Text style={styles.location}>Narre Warren VIC, Australia</Text>
        <View style={styles.row}>
          <Text style={styles.linkText}>See your public profile</Text>
          <Text style={styles.editText}> | Edit</Text>
        </View>
      </View>

      {/* Settings List */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>
        <MenuItem icon={<MaterialIcons name="payment" size={20} />} text="Payment options" />
        <MenuItem icon={<Feather name="lock" size={20} />} text="Account Information" />

        <Text style={styles.sectionTitle}>NOTIFICATION SETTINGS</Text>
        <MenuItem icon={<Ionicons name="notifications-outline" size={20} />} text="Notification preferences" />
        <MenuItem
          icon={<Entypo name="slideshare" size={20} />}
          text="Task alerts for Taskers"
          subtext="Be the first to know relevant tasks"
        />

        <Text style={styles.sectionTitle}>NOTIFICATION SETTINGS</Text>
        <MenuItem icon={<Feather name="bar-chart-2" size={20} />} text="Dashboard" />
      </View>
    </ScrollView>
  );
}

const MenuItem = ({ icon, text, subtext }: any) => (
  <TouchableOpacity style={styles.menuItem}>
    <View style={styles.iconWrapper}>{icon}</View>
    <View style={{ flex: 1 }}>
      <Text style={styles.menuText}>{text}</Text>
      {subtext && <Text style={styles.subtext}>{subtext}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={18} color="#888" />
  </TouchableOpacity>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#0052A2',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileImage: {
    width: 65,
    height: 65,
    borderRadius: 50,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  location: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 13,
    color: '#fff',
    textDecorationLine: 'underline',
  },
  editText: {
    fontSize: 13,
    color: '#fff',
  },
  card: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 25,
    marginBottom: 10,
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iconWrapper: {
    width: 26,
    marginRight: 14,
    marginTop: 4,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#003366',
  },
  subtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});
