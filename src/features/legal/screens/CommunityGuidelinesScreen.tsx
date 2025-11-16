import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function CommunityGuidelinesScreen() {
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
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
        <Text style={styles.headerTitle}>Community Guidelines</Text>
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
            <Text style={styles.introTitle}>MyToDoo Community Guidelines</Text>
            <Text style={styles.introText}>
              These Community Guidelines set out how we expect all Users to behave when using the MyToDoo Platform. They are designed to keep the community safe, fair, and respectful. These Guidelines form part of the Terms & Conditions.
            </Text>
          </View>

          {/* 1. Respect and Courtesy */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>1.</Text>
            <Text style={styles.sectionTitle}>Respect and Courtesy</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Treat all other Users with respect.</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>No harassment, abuse, threats, discrimination, or offensive language.</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Communicate clearly and professionally when posting or completing Tasks.</Text>
          </View>

          {/* 2. Honesty and Transparency */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>2.</Text>
            <Text style={styles.sectionTitle}>Honesty and Transparency</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Be truthful in your profile, skills, and experience.</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Posters must provide clear and accurate details about the Task.</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Taskers must not misrepresent their ability or qualifications to complete a Task.</Text>
          </View>

          {/* 3. Safety First */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>3.</Text>
            <Text style={styles.sectionTitle}>Safety First</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Only post and accept lawful Tasks.</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Do not post or accept Tasks that could endanger health, safety, or property without proper licenses and precautions.</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Follow all relevant work health and safety laws of your country and State when completing Tasks.</Text>
          </View>

          {/* 4. No Subcontracting */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>4.</Text>
            <Text style={styles.sectionTitle}>No Subcontracting</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>The Tasker who accepts the Task must be the one to complete it.</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Tasks cannot be subcontracted, transferred, or shared with others.</Text>
          </View>

          {/* 5. Payments */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>5.</Text>
            <Text style={styles.sectionTitle}>Payments</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>All payments must go through the MyToDoo Platform.</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>No cash payments, off-platform payments, or arrangements outside the Platform.</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Offers must represent the total price of the Task no hidden fees or later mark-ups.</Text>
          </View>

          {/* 6. Cancellations and Reliability */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>6.</Text>
            <Text style={styles.sectionTitle}>Cancellations and Reliability</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Only make or accept Offers you can commit to.</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Repeated cancellations may lead to suspension of your account.</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>If you can't complete a Task, let the other User know as early as possible and follow the cancellation process.</Text>
          </View>

          {/* 7. Verification and Badges */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>7.</Text>
            <Text style={styles.sectionTitle}>Verification and Badges</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Identity verification is required for all Users.</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Optional checks (such as police checks or Working with children or vulnerable persons card) may be required.</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Do not misuse badges or verification tools providing false information is grounds for suspension.</Text>
          </View>

          {/* 8. Feedback and Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>8.</Text>
            <Text style={styles.sectionTitle}>Feedback and Reviews</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Leave fair, honest, and respectful feedback after each Task.</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Reviews must reflect genuine experiences and must not include offensive or defamatory content.</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Do not offer or request fake or incentivised reviews.</Text>
          </View>

          {/* 9. Prohibited Behaviour */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>9.</Text>
            <Text style={styles.sectionTitle}>Prohibited Behaviour</Text>
          </View>
          <Text style={styles.subsectionTitle}>The following conduct is not permitted on the Platform:</Text>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Illegal or unlawful activity.</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Posting or accepting prohibited Tasks (e.g. services without required licences, hazardous activities without proper controls).</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Intellectual property infringement (e.g. using copyrighted material without permission).</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Uploading viruses, malware or malicious code.</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Creating multiple or fake accounts.</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>Attempting to manipulate ratings, reviews, or the payment system.</Text>
          </View>

          {/* 10. Reporting Concerns */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>10.</Text>
            <Text style={styles.sectionTitle}>Reporting Concerns</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>If you experience or witness behaviour that breaches these Guidelines, report it to MyToDoo through the support page.</Text>
          </View>
          <View style={styles.ruleContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.ruleText}>MyToDoo may investigate and take action, including removing content, suspending accounts, or reporting unlawful conduct to authorities.</Text>
          </View>

          {/* Remember Section */}
          <View style={styles.rememberContainer}>
            <Text style={styles.rememberTitle}>🤝 Remember:</Text>
            <Text style={styles.rememberText}>
              The MyToDoo Platform works best when everyone acts honestly, respectfully and responsibly. By following these Guidelines, you help build a safe, fair and supportive community for all Users.
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
    borderLeftColor: '#28a745',
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
    color: '#28a745',
    marginRight: 8,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginLeft: 26,
  },
  ruleContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    marginLeft: 26,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 16,
    color: '#28a745',
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
  rememberContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 20,
    marginTop: 32,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  rememberTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  rememberText: {
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