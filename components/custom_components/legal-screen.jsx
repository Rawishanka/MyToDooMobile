import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LegalScreen = ({ onBack }) => {
  const [currentScreen, setCurrentScreen] = useState('main');

  const BackButton = ({ onPress, title }) => (
    <View style={styles.header}>
      <TouchableOpacity onPress={onPress} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const MenuItem = ({ title, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuText}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  const MainLegalScreen = () => (
    <View style={styles.container}>
      <BackButton 
        onPress={onBack} 
        title="Legal"
      />
      
      <View style={styles.content}>
        <MenuItem 
          title="Privacy policy" 
          onPress={() => setCurrentScreen('privacy')}
        />
        <MenuItem 
          title="Terms & conditions" 
          onPress={() => setCurrentScreen('terms')}
        />
        <MenuItem 
          title="Open source libraries" 
          onPress={() => setCurrentScreen('opensource')}
        />
      </View>
    </View>
  );

  const OpenSourceScreen = () => (
    <View style={styles.container}>
      <BackButton 
        onPress={() => setCurrentScreen('main')} 
        title="Open source libraries"
      />
      
      <View style={styles.content}>
        <MenuItem title="messagingapi_sdk_ios" onPress={() => {}} />
        <MenuItem title="Moya" onPress={() => {}} />
        <MenuItem title="nanopb" onPress={() => {}} />
        <MenuItem title="nwwebsocket" onPress={() => {}} />
        <MenuItem title="PLCrashReporter" onPress={() => {}} />
      </View>
    </View>
  );

  const TermsScreen = () => (
    <View style={styles.container}>
      <BackButton 
        onPress={() => setCurrentScreen('main')} 
        title="Terms & conditions"
      />
      
      <ScrollView style={styles.scrollContent}>
        <Text style={styles.mainTitle}>Terms and Conditions</Text>
        
        <Text style={styles.paragraph}>
          Here are our terms and conditions. Country Specific Terms refer 
          to Appendix B in this Agreement. Please contact us{' '}
          <Text style={styles.link}>here</Text>{' '}
          if you have any other questions. Thanks for connecting.
        </Text>
        
        <Text style={styles.paragraph}>
          The Airtasker terms & conditions (updated 16 May 2025) outline Airtasker and your 
          obligations and responsibilities on the Airtasker Platform. In this update to our Terms and 
          Conditions, Airtasker has updated information related to clarifying the process required (and 
          timing related) when a Task is completed and payment is pending release by the Poster.
        </Text>
        
        <Text style={styles.userAgreement}>
          User Agreement: www.airtasker.com
        </Text>
        
        <Text style={styles.paragraph}>
          Airtasker operates an online platform allowing Users to connect through the Airtasker Platform 
          with other Users who provide Services.
        </Text>
        
        <Text style={styles.paragraph}>
          Please read these terms and all Policies including the{' '}
          <Text style={styles.link}>Community Guidelines</Text>{' '}
          and{' '}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
        
        <TouchableOpacity style={styles.acceptButton}>
          <Text style={styles.acceptButtonText}>Accept updated terms</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const PrivacyScreen = () => (
    <View style={styles.container}>
      <View style={styles.privacyHeader}>
        <TouchableOpacity 
          onPress={() => setCurrentScreen('main')}
          style={styles.doneButton}
        >
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
        <Text style={styles.websiteText}>airtasker.com</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollContent}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>Airtasker</Text>
        </View>
        
        <Text style={styles.privacyTitle}>Privacy policy</Text>
        
        <Text style={styles.lastUpdated}>
          This Privacy Policy was last updated on 26 September 2024.
        </Text>
        
        <Text style={styles.paragraph}>
          Airtasker manages the information that we collect from you in accordance with applicable 
          privacy legislation. In this Privacy Policy, "Airtasker", "we", "our" and/or "us" means:
        </Text>
        
        <Text style={styles.listItem}>
          • (i) where you reside in any country in the European Economic Area or the United 
          Kingdom, Airtasker UK Limited; and
        </Text>
        
        <Text style={styles.listItem}>
          • (ii) where you reside anywhere outside the European Economic Area and the United 
          Kingdom, Airtasker Limited, an Australian company.
        </Text>
        
        <Text style={styles.paragraph}>
          Company details for each of the Airtasker companies is set out in the Contact Us section 
          below.
        </Text>
        
        <Text style={styles.paragraph}>
          This Privacy Policy describes how Airtasker collects, uses, shares and handles your personal
        </Text>
      </ScrollView>
    </View>
  );

  const screens = {
    main: <MainLegalScreen />,
    opensource: <OpenSourceScreen />,
    terms: <TermsScreen />,
    privacy: <PrivacyScreen />
  };

  return screens[currentScreen];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginVertical: 20,
  },
  privacyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 16,
  },
  link: {
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
  userAgreement: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  listItem: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 12,
    paddingLeft: 16,
  },
  acceptButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  doneButton: {
    padding: 8,
  },
  doneText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  websiteText: {
    fontSize: 14,
    color: '#666',
  },
  brandContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  brandText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
  },
});

export default LegalScreen;