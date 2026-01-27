import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Image,
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
      <Text style={styles.descriptionText}>
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
          <Text style={styles.expandedText}>
            If you are responsible for a task cancellation, a Connection fee will be deducted from your account or next payment.
          </Text>
          <Text style={styles.expandedText}>
            This fee helps to cover the administrative costs and compensate taskers for their time spent preparing for your task.
          </Text>
          <View style={styles.feeInfoBox}>
            <Ionicons name="information-circle" size={20} color="#007AFF" />
            <Text style={styles.feeInfoText}>
              Connection fee: AUD $5.00 per cancellation
            </Text>
          </View>
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
          <Text style={styles.expandedText}>
            We may suspend your account if you repeatedly cancel tasks. This protects our community of dedicated taskers.
          </Text>
          <Text style={styles.expandedText}>
            Account suspensions can range from:
          </Text>
          <View style={styles.suspensionList}>
            <View style={styles.suspensionItem}>
              <View style={styles.suspensionDot} />
              <Text style={styles.suspensionText}>Temporary suspensions (1-4 weeks)</Text>
            </View>
            <View style={styles.suspensionItem}>
              <View style={styles.suspensionDot} />
              <Text style={styles.suspensionText}>Permanent account termination</Text>
            </View>
          </View>
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={20} color="#FF9500" />
            <Text style={styles.warningText}>
              3 or more cancellations in 30 days may result in account review
            </Text>
          </View>
        </View>
      )}
    </>
  );

  const renderTaskersContent = () => (
    <>
      <Text style={styles.descriptionText}>
        You're a Tasker if you complete tasks for customers on MyToDoo. You do this by making offers and getting assigned tasks, earning money while helping your community.
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
          <Text style={styles.expandedText}>
            If you are responsible for a task cancellation after accepting the job, a Cancellation fee will be deducted from your next payment payout.
          </Text>
          <Text style={styles.expandedText}>
            This fee compensates customers for the inconvenience and helps maintain trust in our platform.
          </Text>
          <View style={styles.feeInfoBox}>
            <Ionicons name="information-circle" size={20} color="#007AFF" />
            <Text style={styles.feeInfoText}>
              Cancellation fee: AUD $10.00 per task
            </Text>
          </View>
          <Text style={styles.noticeText}>
            Note: No fee applies if you cancel before accepting the task or if the customer cancels first.
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
          <Text style={styles.expandedText}>
            We take repeated cancellations seriously as they impact customers and the MyToDoo community.
          </Text>
          <Text style={styles.expandedText}>
            Consequences may include:
          </Text>
          <View style={styles.suspensionList}>
            <View style={styles.suspensionItem}>
              <View style={styles.suspensionDot} />
              <Text style={styles.suspensionText}>Reduced visibility in task searches</Text>
            </View>
            <View style={styles.suspensionItem}>
              <View style={styles.suspensionDot} />
              <Text style={styles.suspensionText}>Temporary account suspension (1-4 weeks)</Text>
            </View>
            <View style={styles.suspensionItem}>
              <View style={styles.suspensionDot} />
              <Text style={styles.suspensionText}>Permanent account termination</Text>
            </View>
          </View>
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={20} color="#FF9500" />
            <Text style={styles.warningText}>
              2 or more cancellations in 30 days will trigger an account review
            </Text>
          </View>
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
          {/* Understanding the task */}
          <View style={styles.responsibilityItem}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" style={styles.checkIcon} />
            <View style={styles.responsibilityTextContainer}>
              <Text style={styles.responsibilityTitle}>Understanding the task</Text>
              <Text style={styles.responsibilityDescription}>
                Carefully review task details and ask questions before accepting. Ensure you can complete the work as described.
              </Text>
            </View>
          </View>

          {/* Commitment */}
          <View style={styles.responsibilityItem}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" style={styles.checkIcon} />
            <View style={styles.responsibilityTextContainer}>
              <Text style={styles.responsibilityTitle}>Honor your commitment</Text>
              <Text style={styles.responsibilityDescription}>
                Once you accept a task, commit to completing it. Cancellations disappoint customers and damage your reputation.
              </Text>
            </View>
          </View>

          {/* Communication */}
          <View style={styles.responsibilityItem}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" style={styles.checkIcon} />
            <View style={styles.responsibilityTextContainer}>
              <Text style={styles.responsibilityTitle}>Clear communication</Text>
              <Text style={styles.responsibilityDescription}>
                If issues arise, communicate promptly with the customer. Most problems can be resolved through discussion.
              </Text>
            </View>
          </View>

          {/* Professional conduct */}
          <View style={styles.responsibilityItem}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" style={styles.checkIcon} />
            <View style={styles.responsibilityTextContainer}>
              <Text style={styles.responsibilityTitle}>Professional conduct</Text>
              <Text style={styles.responsibilityDescription}>
                Arrive on time, bring necessary equipment, and complete work to a high standard.
              </Text>
            </View>
          </View>
        </View>
      )}
    </>
  );

  const renderCancellationScreen = () => (
    <View style={styles.container}>
      {renderHeader('Cancellation Policy')}
      
      <ScrollView style={styles.content} contentContainerStyle={styles.cancellationScrollContent}>
        {/* Blue header section with logo */}
        <View style={styles.blueHeaderSection}>
          <View style={styles.logoContainerCancellation}>
            <View style={styles.logoBackgroundCancellation}>
              <Image 
                source={require('../../../../assets/images/mytodoo-icon.png')} 
                style={styles.logoCancellation}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Icon illustration */}
          <View style={styles.iconContainerCancellation}>
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

          <Text style={styles.noteTitleWhite}>A note on cancellations</Text>
          <Text style={styles.subtitleWhite}>
            At MyToDoo, we understand that circumstances change. However, cancelling tasks affects our community of taskers and customers. Please review our cancellation policy below.
          </Text>
        </View>

        {/* White content section */}
        {/* White content section */}
        <View style={styles.whiteContentSection}>
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
        </View>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
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
    padding: 20,
    paddingBottom: 40,
  },
  cancellationScrollContent: {
    paddingBottom: 40,
  },
  blueHeaderSection: {
    backgroundColor: '#0a2d5c',
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoContainerCancellation: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logoBackgroundCancellation: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoCancellation: {
    width: 80,
    height: 80,
  },
  iconContainerCancellation: {
    alignItems: 'center',
    marginVertical: 20,
  },
  noteTitleWhite: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  subtitleWhite: {
    fontSize: 15,
    lineHeight: 22,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: 8,
  },
  whiteContentSection: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    backgroundColor: '#fff',
  },
  guidelineTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    flex: 1,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4a4a4a',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  linkText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
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
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  logo: {
    width: 70,
    height: 70,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  documentIcon: {
    position: 'relative',
  },
  documentPage: {
    width: 70,
    height: 90,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  documentShadow: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 70,
    height: 90,
    backgroundColor: '#1a4d8f',
    borderRadius: 12,
    zIndex: -1,
    opacity: 0.9,
  },
  xIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  signatureLine: {
    width: 36,
    height: 2,
    backgroundColor: '#8e8e93',
    borderRadius: 1,
  },
  noteTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginVertical: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#8e8e93',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  expandableSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  expandableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  expandedContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  expandedText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4a4a4a',
    marginBottom: 12,
  },
  feeInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FF',
    padding: 14,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  feeInfoText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 10,
    flex: 1,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#8e8e93',
    fontStyle: 'italic',
    marginTop: 8,
  },
  suspensionList: {
    marginTop: 8,
    marginBottom: 12,
  },
  suspensionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingLeft: 8,
  },
  suspensionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
    marginRight: 12,
  },
  suspensionText: {
    fontSize: 15,
    color: '#4a4a4a',
    flex: 1,
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 14,
    borderRadius: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  understandButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  understandButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  responsibilityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingVertical: 8,
  },
  checkIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  responsibilityTextContainer: {
    flex: 1,
  },
  responsibilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  responsibilityDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});

export default CommunityGuidelines;