import { Entypo, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CommunityGuideLines from '../../components/custom_components/community-guidelines'; // Import the community guidelines screen
import ContactUs from '../../components/custom_components/contact-us';
import EditProfileScreen from '../../components/custom_components/editprofilescreen'; // Import the edit profile screen
import FAQ from '../../components/custom_components/faq-screen';
import LegalScreen from '../../components/custom_components/legal-screen';
import Logout from '../../components/custom_components/Logout';
import AccountInformation from './accountinformation'; // Import the account information screen
import TaskerDashboard from './dashboard'; // Import the tasker dashboard screen
import InsuranceProtection from './isuranceprotection'; // Import the insurance protection screen
import NotificationPreferences from './notificationpreferences'; // Import the notification preferences screen (fixed typo)
import PaymentScreensApp from './paymentscreens'; // Import the payment screens
import TaskAlerts from './taskalerts'; // Import the task alerts screen

export default function AccountScreen() {
  const [currentScreen, setCurrentScreen] = useState('account');

  const navigateToPayment = () => {
    setCurrentScreen('payment');
  };

  const navigateToAccount = () => {
    setCurrentScreen('account');
  };

  const navigateToAccountInfo = () => {
    setCurrentScreen('account-info');
  };

  const navigateToNotifications = () => {
    setCurrentScreen('notifications');
  };

  const navigateToTaskAlerts = () => {
    setCurrentScreen('task-alerts');
  };

  const navigateToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const navigateToInsuranceProtection = () => {
    setCurrentScreen('insurance-protection');
  };

  const navigateToEditProfile = () => {
    setCurrentScreen('edit-profile');
  };

  const navigateToFAQ = () => {
    setCurrentScreen('faq');
  };

  const navigateToCommunityGuidelines = () => {
    setCurrentScreen('community-guidelines');
  };

  const navigateToLegalScreen = () => {
    setCurrentScreen('legal');
  };

  const navigateToLogoutScreen = () => {
    setCurrentScreen('logout');
  }

  const navigateToContactUs = () => {
    setCurrentScreen('contact-us');
  };

  // If edit profile screen is selected, show edit profile
  if (currentScreen === 'edit-profile') {
    return <EditProfileScreen onBack={navigateToAccount} onSave={undefined} />;
  }

  // If payment screen is selected, show payment screens
  if (currentScreen === 'payment') {
    return <PaymentScreensApp onBackToAccount={navigateToAccount} />;
  }

  // If account info screen is selected, show account information
  if (currentScreen === 'account-info') {
    return <AccountInformation onBack={navigateToAccount} />;
  }

  // If notifications screen is selected, show notification preferences
  if (currentScreen === 'notifications') {
    return <NotificationPreferences onBack={navigateToAccount} />;
  }

  // If task alerts screen is selected, show task alerts
  if (currentScreen === 'task-alerts') {
    return <TaskAlerts onBack={navigateToAccount} />;
  }

  // If dashboard screen is selected, show tasker dashboard
  if (currentScreen === 'dashboard') {
    return <TaskerDashboard onBack={navigateToAccount} />;
  }

  if (currentScreen === 'insurance-protection') {
    return <InsuranceProtection onBack={navigateToAccount} />;
  }

  if (currentScreen === 'faq') {
    return <FAQ visible={true} onClose={navigateToAccount} />;
  } 

  if (currentScreen === 'community-guidelines') {
    return <CommunityGuideLines visible={true} onClose={navigateToAccount} />;
  }

  if (currentScreen === 'legal') {
    return <LegalScreen onBack={navigateToAccount} />;
  }

  if (currentScreen === 'logout') {
    return <Logout onBack={navigateToAccount} />;
  } 

  if (currentScreen === 'contact-us') {
    return <ContactUs onBack={navigateToAccount} />;
  }

  // Otherwise show account screen
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
        </View>
        
        {/* Edit Icon */}
        <TouchableOpacity 
          style={styles.editIconButton} 
          onPress={navigateToEditProfile}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Settings List */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>
        <MenuItem 
          icon={<MaterialIcons name="payment" size={20} color="#0052A2" />}
          text="Payment options"
          onPress={navigateToPayment} 
          subtext={undefined}        
        />
        <MenuItem 
          icon={<Feather name="lock" size={20} color="#0052A2" />}
          text="Account Information"
          onPress={navigateToAccountInfo} 
          subtext={undefined}        
        />

        <Text style={styles.sectionTitle}>NOTIFICATION SETTINGS</Text>
        <MenuItem 
          icon={<Ionicons name="notifications-outline" size={20} color="#0052A2" />}
          text="Notification preferences" 
          subtext={undefined} 
          onPress={navigateToNotifications}        
        />
        <MenuItem
          icon={<Entypo name="slideshare" size={20} color="#0052A2" />}
          text="Task alerts for Taskers"
          subtext="Be the first to know relevant tasks" 
          onPress={navigateToTaskAlerts}        
        />

        <Text style={styles.sectionTitle}>FOR TASKERS</Text>
        <MenuItem 
          icon={<Feather name="bar-chart-2" size={20} color="#0052A2" />}
          text="My dashboard" 
          subtext={undefined} 
          onPress={navigateToDashboard}        
        />
        <MenuItem 
          icon={<Feather name="list" size={20} color="#0052A2" />}
          text="List my services"
          subtext="Create listings for your services so customers come to you" 
          onPress={undefined}        
        />

        <Text style={styles.sectionTitle}>HELP AND SUPPORT</Text>
        <MenuItem 
          icon={<Ionicons name="help-circle-outline" size={20} color="#0052A2" />}
          text="Frequently asked questions" 
          subtext={undefined} 
          onPress={navigateToFAQ}        
        />

        <MenuItem 
          icon={<Ionicons name="people-outline" size={20} color="#0052A2" />}
          text="Community guidelines" 
          subtext={undefined} 
          onPress={navigateToCommunityGuidelines}        
        />
        <MenuItem 
          icon={<Ionicons name="mail-outline" size={20} color="#0052A2" />}
          text="Contact us" 
          subtext={undefined} 
          onPress={navigateToContactUs}        
        />

        <Text style={styles.sectionTitle}>SAFETY</Text>
        <MenuItem 
          icon={<Ionicons name="shield-outline" size={20} color="#0052A2" />}
          text="Insurance Protection" 
          subtext={undefined} 
          onPress={navigateToInsuranceProtection}        
        />
        <MenuItem 
          icon={<Ionicons name="document-text-outline" size={20} color="#0052A2" />}
          text="Legal" 
          subtext={undefined} 
          onPress={navigateToLegalScreen}        
        />
        <MenuItem 
          icon={<Ionicons name="log-out-outline" size={20} color="#0052A2" />}
          text="Logout" 
          subtext={undefined} 
          onPress={navigateToLogoutScreen}
        />
      </View>

    </ScrollView>
  );
}

type MenuItemProps = {
  icon: React.ReactNode;
  text: string;
  subtext?: string;
  onPress?: () => void;
};

const MenuItem: React.FC<MenuItemProps> = ({ icon, text, subtext, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
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
    position: 'relative',
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
  editIconButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 8,
  },
  card: {
    paddingHorizontal: 20,
    paddingTop: 24,
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
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 'auto',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navText: {
    fontSize: 10,
    color: '#0052A2',
    marginTop: 2,
  },
});