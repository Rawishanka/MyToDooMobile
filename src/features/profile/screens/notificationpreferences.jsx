import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';

export default function NotificationPreferences({ onBack }) {
  const [currentScreen, setCurrentScreen] = useState('main');
  
  // State for notification settings
  const [transactionalSettings, setTransactionalSettings] = useState({
    email: true,
    sms: true,
    push: true,
  });
  
  const [taskUpdatesSettings, setTaskUpdatesSettings] = useState({
    email: true,
    sms: true,
    push: true,
  });
  
  const [taskRemindersSettings, setTaskRemindersSettings] = useState({
    email: true,
    sms: true,
    push: true,
  });
  
  const [keywordAlertsSettings, setKeywordAlertsSettings] = useState({
    push: true,
  });
  
  const [recommendedAlertsSettings, setRecommendedAlertsSettings] = useState({
    push: true,
  });
  
  const [helpfulInfoSettings, setHelpfulInfoSettings] = useState({
    email: true,
    sms: true,
    push: true,
  });
  
  const [updatesNewslettersSettings, setUpdatesNewslettersSettings] = useState({
    email: true,
    sms: true,
    push: true,
  });

  const navigateToDetail = (screenName) => {
    setCurrentScreen(screenName);
  };

  const navigateBack = () => {
    setCurrentScreen('main');
  };

  // Detail screens for each notification type
  const renderTransactionalScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0052A2" />
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transactional</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.description}>
          You will always receive important notifications about any payments, cancellations and your account.
        </Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Email</Text>
          <Switch
            value={transactionalSettings.email}
            onValueChange={(value) => setTransactionalSettings({...transactionalSettings, email: value})}
            trackColor={{ false: '#ccc', true: '#0052A2' }}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>SMS</Text>
          <Switch
            value={transactionalSettings.sms}
            onValueChange={(value) => setTransactionalSettings({...transactionalSettings, sms: value})}
            trackColor={{ false: '#ccc', true: '#0052A2' }}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push</Text>
          <Switch
            value={transactionalSettings.push}
            onValueChange={(value) => setTransactionalSettings({...transactionalSettings, push: value})}
            trackColor={{ false: '#ccc', true: '#0052A2' }}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderTaskUpdatesScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0052A2" />
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task updates</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.description}>
          Receive updates on any new comments, private messages, offers and reviews.
        </Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Email</Text>
          <Switch
            value={taskUpdatesSettings.email}
            onValueChange={(value) => setTaskUpdatesSettings({...taskUpdatesSettings, email: value})}
            trackColor={{ false: '#ccc', true: '#0052A2' }}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>SMS</Text>
          <Switch
            value={taskUpdatesSettings.sms}
            onValueChange={(value) => setTaskUpdatesSettings({...taskUpdatesSettings, sms: value})}
            trackColor={{ false: '#ccc', true: '#0052A2' }}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push</Text>
          <Switch
            value={taskUpdatesSettings.push}
            onValueChange={(value) => setTaskUpdatesSettings({...taskUpdatesSettings, push: value})}
            trackColor={{ false: '#ccc', true: '#0052A2' }}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderTaskRemindersScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0052A2" />
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task reminders</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.description}>
          Friendly reminders if you've forgotten to accept an offer, release a payment or leave a review.
        </Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Email</Text>
          <Switch
            value={taskRemindersSettings.email}
            onValueChange={(value) => setTaskRemindersSettings({...taskRemindersSettings, email: value})}
            trackColor={{ false: '#ccc', true: '#0052A2' }}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>SMS</Text>
          <Switch
            value={taskRemindersSettings.sms}
            onValueChange={(value) => setTaskRemindersSettings({...taskRemindersSettings, sms: value})}
            trackColor={{ false: '#ccc', true: '#0052A2' }}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push</Text>
          <Switch
            value={taskRemindersSettings.push}
            onValueChange={(value) => setTaskRemindersSettings({...taskRemindersSettings, push: value})}
            trackColor={{ false: '#ccc', true: '#0052A2' }}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderKeywordAlertsScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0052A2" />
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Keyword task alerts</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.description}>
          Once you've set up your keyword task alerts, you'll be instantly notified when a task is posted that matches your preferences.
        </Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push</Text>
          <Switch
            value={keywordAlertsSettings.push}
            onValueChange={(value) => setKeywordAlertsSettings({...keywordAlertsSettings, push: value})}
            trackColor={{ false: '#ccc', true: '#0052A2' }}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderRecommendedAlertsScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0052A2" />
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recommended task alerts</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.description}>
          Get notified about tasks that match your skills and location. We'll recommend tasks based on your profile and previous activity.
        </Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push</Text>
          <Switch
            value={recommendedAlertsSettings.push}
            onValueChange={(value) => setRecommendedAlertsSettings({...recommendedAlertsSettings, push: value})}
            trackColor={{ false: '#ccc', true: '#0052A2' }}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderHelpfulInfoScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0052A2" />
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Helpful information</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.description}>
          Tips, guides and helpful information to get the most out of Airtasker and improve your success rate.
        </Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Email</Text>
          <Switch
            value={helpfulInfoSettings.email}
            onValueChange={(value) => setHelpfulInfoSettings({...helpfulInfoSettings, email: value})}
            trackColor={{ false: '#ccc', true: '#0052A2' }}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>SMS</Text>
          <Switch
            value={helpfulInfoSettings.sms}
            onValueChange={(value) => setHelpfulInfoSettings({...helpfulInfoSettings, sms: value})}
            trackColor={{ false: '#ccc', true: '#0052A2' }}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push</Text>
          <Switch
            value={helpfulInfoSettings.push}
            onValueChange={(value) => setHelpfulInfoSettings({...helpfulInfoSettings, push: value})}
            trackColor={{ false: '#ccc', true: '#0052A2' }}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderUpdatesNewslettersScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0052A2" />
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Updates & newsletters</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.description}>
          Be the first to hear about new features and exciting updates on Airtasker.
        </Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Email</Text>
          <Switch
            value={updatesNewslettersSettings.email}
            onValueChange={(value) => setUpdatesNewslettersSettings({...updatesNewslettersSettings, email: value})}
            trackColor={{ false: '#ccc', true: '#0052A2' }}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>SMS</Text>
          <Switch
            value={updatesNewslettersSettings.sms}
            onValueChange={(value) => setUpdatesNewslettersSettings({...updatesNewslettersSettings, sms: value})}
            trackColor={{ false: '#ccc', true: '#0052A2' }}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push</Text>
          <Switch
            value={updatesNewslettersSettings.push}
            onValueChange={(value) => setUpdatesNewslettersSettings({...updatesNewslettersSettings, push: value})}
            trackColor={{ false: '#ccc', true: '#0052A2' }}
          />
        </View>
      </View>
    </ScrollView>
  );

  // Switch between screens
  switch (currentScreen) {
    case 'transactional':
      return renderTransactionalScreen();
    case 'task-updates':
      return renderTaskUpdatesScreen();
    case 'task-reminders':
      return renderTaskRemindersScreen();
    case 'keyword-alerts':
      return renderKeywordAlertsScreen();
    case 'recommended-alerts':
      return renderRecommendedAlertsScreen();
    case 'helpful-info':
      return renderHelpfulInfoScreen();
    case 'updates-newsletters':
      return renderUpdatesNewslettersScreen();
    default:
      break;
  }

  // Main notification settings screen
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0052A2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification settings</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>TRANSACTIONAL</Text>
        <NotificationMenuItem 
          text="Transactional"
          subtext="Email, SMS, Push"
          onPress={() => navigateToDetail('transactional')}
        />

        <Text style={styles.sectionTitle}>REMINDERS & UPDATES</Text>
        <NotificationMenuItem 
          text="Task updates"
          subtext="Email, SMS, Push"
          onPress={() => navigateToDetail('task-updates')}
        />
        <NotificationMenuItem 
          text="Task reminders"
          subtext="Email, SMS, Push"
          onPress={() => navigateToDetail('task-reminders')}
        />

        <Text style={styles.sectionTitle}>TASK ALERTS</Text>
        <NotificationMenuItem 
          text="Keyword task alerts"
          subtext="Push"
          onPress={() => navigateToDetail('keyword-alerts')}
        />
        <NotificationMenuItem 
          text="Recommended task alerts"
          subtext="Push"
          onPress={() => navigateToDetail('recommended-alerts')}
        />

        <Text style={styles.sectionTitle}>OTHER NOTIFICATIONS</Text>
        <NotificationMenuItem 
          text="Helpful information"
          subtext="Email, SMS, Push"
          onPress={() => navigateToDetail('helpful-info')}
        />
        <NotificationMenuItem 
          text="Updates & newsletters"
          subtext="Email, SMS, Push"
          onPress={() => navigateToDetail('updates-newsletters')}
        />
      </View>
    </ScrollView>
  );
}

/**
 * @typedef {Object} NotificationMenuItemProps
 * @property {string} text
 * @property {string} [subtext]
 * @property {function} [onPress]
 */ 

const NotificationMenuItem = ({ text, subtext, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveText: {
    fontSize: 16,
    color: '#0052A2',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#003366',
    flex: 1,
    textAlign: 'center',
    marginRight: 60, // To center the title accounting for back button
  },
  content: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 20,
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
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 16,
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#003366',
    fontWeight: '500',
  },
});