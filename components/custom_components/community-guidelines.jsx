import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const CommunityGuidelines = ({ visible, onClose }) => {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'posting', 'earning', 'cancellation'
  const [selectedTab, setSelectedTab] = useState('customers'); // 'customers' or 'taskers'
  const [expandedSections, setExpandedSections] = useState({
    connectionFee: false,
    repeatedCancellations: false,
    taskerResponsibilities: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderHeader = (title, showBack = true) => (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity onPress={() => setCurrentView('main')} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  const renderMainScreen = () => (
    <View style={styles.container}>
      {renderHeader('Community guidelines', false)}
      
      <ScrollView style={styles.content}>
        <TouchableOpacity 
          style={styles.guidelineItem} 
          onPress={() => setCurrentView('posting')}
        >
          <Text style={styles.guidelineTitle}>Posting tasks as a Customer</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.guidelineItem} 
          onPress={() => setCurrentView('earning')}
        >
          <Text style={styles.guidelineTitle}>Earning money as a Tasker</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.guidelineItem} 
          onPress={() => setCurrentView('cancellation')}
        >
          <Text style={styles.guidelineTitle}>Cancellation Policy</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderPostingTasksScreen = () => (
    <View style={styles.container}>
      {renderHeader('Posting tasks as a Customer')}
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
        <Text style={styles.bodyText}>
          We love connecting people who need work done (you!) with members of the local community who want to work. Our community is growing every day and it's important to us that all of you have a safe and enjoyable experience on Airtasker. That's why we have these{' '}
          <Text style={styles.linkText}>Community Guidelines</Text>, to share the values and standards of behaviour we expect everyone to follow.
        </Text>

        <Text style={styles.bodyText}>
          We're here to facilitate making this marketplace reliable, safe and beneficial for you, and also help resolve any issues that may arise. But we can't do it alone. To help us help you, we ask for your cooperation and timely response when engaging with our Airtasker Support team.
        </Text>

        <Text style={styles.bodyText}>
          If you see something that violates these Community Guidelines, please reach out to AirSupport and report it to us ASAP. Click the 'Report as Inappropriate' button located within the task or comments section, or go to{' '}
          <Text style={styles.linkText}>Contact Us</Text>.
        </Text>

        <Text style={styles.bodyText}>
          These Community Guidelines are here to protect you, and we take breaches of them seriously. If you are found to have When a person breaches our Community Guidelines, we may take action to remove any content, offers, suspend or even permanently cancel your account.
        </Text>
      </ScrollView>
    </View>
  );

  const renderEarningMoneyScreen = () => (
    <View style={styles.container}>
      {renderHeader('Earning money as a Tasker')}
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
        <Text style={styles.bodyText}>
          not be shared in any public areas of the site including in any comments and attachments. Private contact details and third party links include, but are not limited to, business websites, Facebook, LinkedIn, Twitter, personal emails, phone numbers, addresses or personal websites.
        </Text>

        <Text style={styles.sectionTitle}>2. Unacceptable behaviours</Text>

        <Text style={styles.bodyText}>
          We're all about our community. Without you, there's no us. So courtesy, mutual respect and keeping an open mindset on people's perspectives is essential. At Airtasker, we do not tolerate the following negative behaviours against other members of the Airtasker Community or our staff:
        </Text>

        <Text style={styles.bulletPoint}>• Hatred or violence</Text>
        <Text style={styles.bodyText}>
          - Comments or actions that promote hatred or violence against specific groups or people, including any representatives of Airtasker, will not be tolerated.
        </Text>

        <Text style={styles.bodyText}>
          - Racist content or behaviour to incite racism is also not permitted.
        </Text>

        <Text style={styles.bodyText}>
          - All aggressive behaviour, including swearing, verbal threats, threatening language or actions and any forms of violence are strictly prohibited.
        </Text>
      </ScrollView>
    </View>
  );

  const renderCustomersContent = () => (
    <>
      <Text style={styles.bodyText}>
        You're a Customer if you're looking to get tasks completed. You do this by posting tasks and assigning Taskers to do the job, or booking Taskers through their listings.
      </Text>

      {/* Connection fee expandable section */}
      <TouchableOpacity 
        style={styles.expandableSection}
        onPress={() => toggleSection('connectionFee')}
      >
        <Text style={styles.expandableTitle}>Connection fee</Text>
        <Ionicons 
          name={expandedSections.connectionFee ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#007AFF" 
        />
      </TouchableOpacity>

      {expandedSections.connectionFee && (
        <View style={styles.expandedContent}>
          <Text style={styles.bodyText}>
            If you are responsible for a task cancellation, a Connection fee will be deducted from your next payment payout.
          </Text>
          <Text style={styles.bodyText}>
            This fee helps to cover the costs related to connecting a Customer and Tasker.
          </Text>
        </View>
      )}

      {/* Repeated cancellations expandable section */}
      <TouchableOpacity 
        style={styles.expandableSection}
        onPress={() => toggleSection('repeatedCancellations')}
      >
        <Text style={styles.expandableTitle}>Repeated cancellations</Text>
        <Ionicons 
          name={expandedSections.repeatedCancellations ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#007AFF" 
        />
      </TouchableOpacity>

      {expandedSections.repeatedCancellations && (
        <View style={styles.expandedContent}>
          <Text style={styles.bodyText}>
            We may suspend your account if you repeatedly cancel tasks. This applies to both Customers and Taskers.
          </Text>
          <Text style={styles.bodyText}>
            Account suspensions can range from temporary suspensions (i.e. 1 week suspension) to permanent suspensions.
          </Text>
        </View>
      )}
    </>
  );

  const renderTaskersContent = () => (
    <>
      <Text style={styles.bodyText}>
        You're a Tasker if you complete tasks for other people on Airtasker. You do this by making offers and getting assigned tasks.
      </Text>

      {/* Cancellation fee expandable section */}
      <TouchableOpacity 
        style={styles.expandableSection}
        onPress={() => toggleSection('connectionFee')}
      >
        <Text style={styles.expandableTitle}>Cancellation fee</Text>
        <Ionicons 
          name={expandedSections.connectionFee ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#007AFF" 
        />
      </TouchableOpacity>

      {expandedSections.connectionFee && (
        <View style={styles.expandedContent}>
          <Text style={styles.bodyText}>
            If you are responsible for a task cancellation, a Cancellation fee, will be deducted from your next payment payout.
          </Text>
          <Text style={styles.bodyText}>
            This fee helps to cover the costs related to connecting a Customer and Tasker.
          </Text>
        </View>
      )}

      {/* Repeated cancellations expandable section */}
      <TouchableOpacity 
        style={styles.expandableSection}
        onPress={() => toggleSection('repeatedCancellations')}
      >
        <Text style={styles.expandableTitle}>Repeated cancellations</Text>
        <Ionicons 
          name={expandedSections.repeatedCancellations ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#007AFF" 
        />
      </TouchableOpacity>

      {expandedSections.repeatedCancellations && (
        <View style={styles.expandedContent}>
          <Text style={styles.bodyText}>
            We may suspend your account if you repeatedly cancel tasks. This applies to both Customers and Taskers.
          </Text>
          <Text style={styles.bodyText}>
            Account suspensions can range from temporary suspensions (i.e. 1 week suspension) to permanent suspensions.
          </Text>
        </View>
      )}

      {/* Your responsibilities as a Tasker expandable section */}
      <TouchableOpacity 
        style={styles.expandableSection}
        onPress={() => toggleSection('taskerResponsibilities')}
      >
        <Text style={styles.expandableTitle}>Your responsibilities as a Tasker</Text>
        <Ionicons 
          name={expandedSections.taskerResponsibilities ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#007AFF" 
        />
      </TouchableOpacity>

      {expandedSections.taskerResponsibilities && (
        <View style={styles.expandedContent}>
          <Text style={styles.bodyText}>
            As a Tasker, you are responsible for communicating professionally and completing tasks as agreed. Any cancellations should be done with appropriate notice and valid reasons.
          </Text>
        </View>
      )}
    </>
  );

  const renderCancellationScreen = () => (
    <View style={styles.container}>
      {renderHeader('Cancellation Policy')}
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
        {/* Icon illustration */}
        <View style={styles.iconContainer}>
          <View style={styles.documentIcon}>
            <View style={styles.documentPage}>
              <View style={styles.xIcon}>
                <Ionicons name="close" size={16} color="#fff" />
              </View>
              <View style={styles.signatureLine} />
            </View>
            <View style={styles.documentShadow} />
          </View>
        </View>

        <Text style={styles.noteTitle}>A note on cancellations</Text>
        <Text style={styles.bodyText}>
          Cancelling tasks will incur fees. Learn more about our{' '}
          <Text style={styles.linkText}>Cancellation Policy</Text>.
        </Text>

        {/* Tab selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'customers' && styles.activeTab]}
            onPress={() => setSelectedTab('customers')}
          >
            <Text style={[styles.tabText, selectedTab === 'customers' && styles.activeTabText]}>
              For Customers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'taskers' && styles.activeTab]}
            onPress={() => setSelectedTab('taskers')}
          >
            <Text style={[styles.tabText, selectedTab === 'taskers' && styles.activeTabText]}>
              For Taskers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic content based on selected tab */}
        {selectedTab === 'customers' ? renderCustomersContent() : renderTaskersContent()}

        {/* Bottom button */}
        <TouchableOpacity 
          style={styles.understandButton}
          onPress={() => setCurrentView('main')}
        >
          <Text style={styles.understandButtonText}>I understand</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      {currentView === 'main' && renderMainScreen()}
      {currentView === 'posting' && renderPostingTasksScreen()}
      {currentView === 'earning' && renderEarningMoneyScreen()}
      {currentView === 'cancellation' && renderCancellationScreen()}
    </Modal>
  );
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
    borderBottomColor: '#e1e4e8',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 16,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  guidelineTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  linkText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
  },
  bulletPoint: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  documentIcon: {
    position: 'relative',
  },
  documentPage: {
    width: 60,
    height: 80,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e1e4e8',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  documentShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 60,
    height: 80,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    zIndex: -1,
  },
  xIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  signatureLine: {
    width: 30,
    height: 2,
    backgroundColor: '#666',
    borderRadius: 1,
  },
  noteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginVertical: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#333',
    fontWeight: '600',
  },
  expandableSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: 16,
  },
  expandableTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  expandedContent: {
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  understandButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  understandButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CommunityGuidelines;