import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface PrivacyPolicyScreenProps {
  onBack?: () => void;
}

export default function PrivacyPolicyScreen({ onBack }: PrivacyPolicyScreenProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          
          {/* Introduction */}
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>MyToDoo Privacy Policy</Text>
            <Text style={styles.introText}>
              MyToDoo respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and disclose your personal information in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles.
            </Text>
          </View>

          {/* Information We Collect */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>1.</Text>
            <Text style={styles.sectionTitle}>Information We Collect</Text>
          </View>
          
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Personal Information</Text>
            <Text style={styles.bodyText}>
              We collect personal information that you provide to us when you register for an account, post tasks, make offers, or use our services. This may include:
            </Text>
            <View style={styles.ruleContainer}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.ruleText}>Name, email address, and contact details</Text>
            </View>
            <View style={styles.ruleContainer}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.ruleText}>Payment and banking information</Text>
            </View>
            <View style={styles.ruleContainer}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.ruleText}>Identity verification documents</Text>
            </View>
            <View style={styles.ruleContainer}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.ruleText}>Location data and address information</Text>
            </View>
            <View style={styles.ruleContainer}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.ruleText}>Profile information, skills, and qualifications</Text>
            </View>
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Usage Information</Text>
            <Text style={styles.bodyText}>
              We automatically collect information about how you use our Platform, including:
            </Text>
            <View style={styles.ruleContainer}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.ruleText}>Device information and IP addresses</Text>
            </View>
            <View style={styles.ruleContainer}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.ruleText}>App usage patterns and preferences</Text>
            </View>
            <View style={styles.ruleContainer}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.ruleText}>Transaction history and task activities</Text>
            </View>
          </View>

          {/* How We Use Your Information */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>2.</Text>
            <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          </View>

          <Text style={styles.bodyText}>We use your personal information to:</Text>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Provide and operate the MyToDoo Platform</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Facilitate task posting, offers, and payments</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Verify your identity and prevent fraud</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Communicate with you about your account and services</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Improve our services and develop new features</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Comply with legal obligations and resolve disputes</Text>
          </View>

          {/* Information Sharing */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>3.</Text>
            <Text style={styles.sectionTitle}>Information Sharing</Text>
          </View>

          <Text style={styles.bodyText}>We may share your information with:</Text>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Other users when you post tasks or make offers (limited to relevant task information)</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Payment processors (Stripe) for transaction processing</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Verification service providers for identity checks</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Law enforcement or regulatory authorities when required by law</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Our service providers who help operate the Platform</Text>
          </View>

          {/* Your Rights */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>4.</Text>
            <Text style={styles.sectionTitle}>Your Rights</Text>
          </View>

          <Text style={styles.bodyText}>Under Australian privacy laws, you have the right to:</Text>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Access your personal information</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Correct any inaccurate or incomplete information</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Request deletion of your information (subject to legal requirements)</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Make a complaint about how we handle your information</Text>
          </View>

          {/* Data Security */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>5.</Text>
            <Text style={styles.sectionTitle}>Data Security</Text>
          </View>

          <Text style={styles.bodyText}>
            We implement reasonable security measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.
          </Text>

          {/* Data Retention */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>6.</Text>
            <Text style={styles.sectionTitle}>Data Retention</Text>
          </View>

          <Text style={styles.bodyText}>
            We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. When information is no longer needed, we will securely delete or anonymize it.
          </Text>

          {/* Contact Us */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>7.</Text>
            <Text style={styles.sectionTitle}>Contact Us</Text>
          </View>

          <Text style={styles.bodyText}>
            If you have any questions about this Privacy Policy or how we handle your personal information, please contact us through the support channels available on the Platform.
          </Text>

          {/* Updates Notice */}
          <View style={styles.noticeContainer}>
            <Text style={styles.noticeTitle}>📋 Policy Updates</Text>
            <Text style={styles.noticeText}>
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes via email or through the Platform.
            </Text>
          </View>

          {/* Last Updated */}
          <View style={styles.lastUpdated}>
            <Text style={styles.lastUpdatedText}>
              Last updated: {new Date().toLocaleDateString('en-AU', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>

          {/* Bottom spacing for scroll */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  introSection: {
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6c5ce7',
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  introText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    textAlign: 'justify',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    marginTop: 24,
  },
  sectionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6c5ce7',
    marginRight: 8,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  subsection: {
    marginBottom: 16,
    marginLeft: 26,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    textAlign: 'justify',
    marginBottom: 12,
    marginLeft: 26,
  },
  ruleContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    marginLeft: 26,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 16,
    color: '#6c5ce7',
    marginRight: 12,
    marginTop: 1,
    fontWeight: 'bold',
  },
  ruleText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    flex: 1,
    textAlign: 'justify',
  },
  noticeContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 32,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#6c5ce7',
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    textAlign: 'justify',
  },
  lastUpdated: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 40,
  },
});