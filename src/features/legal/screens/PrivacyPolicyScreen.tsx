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
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

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
          <Ionicons name="arrow-back" size={wp('6%')} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          
          {/* Introduction */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>1.</Text>
            <Text style={styles.sectionTitle}>Your Privacy Matters</Text>
          </View>
          
          <Text style={styles.bodyText}>
            MyToDoo respects your privacy and protects your personal information in accordance with the Privacy Act 1988 (Cth) and Australian Privacy Principles. This policy explains how we collect, use, and safeguard your data.
          </Text>

          {/* Information We Collect */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>2.</Text>
            <Text style={styles.sectionTitle}>Information We Collect</Text>
          </View>
          
          <Text style={styles.bodyText}>We collect information you provide and usage data to operate our platform:</Text>
          
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Name, email, and contact details</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Payment and banking information</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Identity verification documents</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Location and address information</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Device and usage data</Text>
          </View>

          {/* How We Use Your Information */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>3.</Text>
            <Text style={styles.sectionTitle}>How We Use Your Data</Text>
          </View>

          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Operate the MyToDoo platform and facilitate tasks</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Process payments and verify identities</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Communicate about your account and services</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Improve features and prevent fraud</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Comply with legal obligations</Text>
          </View>

          {/* Information Sharing */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>4.</Text>
            <Text style={styles.sectionTitle}>Sharing Your Information</Text>
          </View>

          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Other users (task-relevant information only)</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Payment processors for transactions</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Verification service providers</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Law enforcement when required by law</Text>
          </View>

          {/* Your Rights */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>5.</Text>
            <Text style={styles.sectionTitle}>Your Privacy Rights</Text>
          </View>

          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Access your personal information</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Correct inaccurate information</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Request deletion (subject to legal requirements)</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Make privacy complaints</Text>
          </View>

          {/* Data Security */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>6.</Text>
            <Text style={styles.sectionTitle}>Security & Retention</Text>
          </View>

          <Text style={styles.bodyText}>
            We use industry-standard security measures to protect your data. Information is retained as long as necessary for services, legal compliance, and dispute resolution.
          </Text>

          {/* Contact Us */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>7.</Text>
            <Text style={styles.sectionTitle}>Contact Us</Text>
          </View>

          <Text style={styles.bodyText}>
            Questions about privacy? Contact us through the support channels in the app.
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.8%'),
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp('0.25%') },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: wp('2%'),
    marginRight: wp('2%'),
  },
  headerTitle: {
    flex: 1,
    fontSize: RFValue(17),
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginHorizontal: wp('2%'),
  },
  headerSpacer: {
    width: wp('10%'),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp('4%'),
  },
  contentContainer: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2.5%'),
  },
  section: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp('1.5%'),
    marginTop: hp('3.5%'),
  },
  sectionNumber: {
    fontSize: RFValue(22),
    fontWeight: '800',
    color: '#6c5ce7',
    marginRight: wp('2.5%'),
    marginTop: hp('0.25%'),
  },
  sectionTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    lineHeight: RFValue(26),
  },
  subsection: {
    marginBottom: hp('2%'),
    marginLeft: 0,
  },
  subsectionTitle: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp('1%'),
  },
  bodyText: {
    fontSize: RFValue(14),
    lineHeight: RFValue(22),
    color: '#4a5568',
    marginBottom: hp('1.5%'),
    marginLeft: wp('8%'),
  },
  bulletContainer: {
    flexDirection: 'row',
    marginBottom: hp('1.25%'),
    marginLeft: wp('8%'),
    alignItems: 'flex-start',
    paddingRight: wp('2%'),
  },
  bulletPoint: {
    fontSize: RFValue(16),
    color: '#6c5ce7',
    marginRight: wp('2.5%'),
    marginTop: hp('0.25%'),
    fontWeight: '600',
  },
  noticeContainer: {
    backgroundColor: '#f5f3ff',
    borderRadius: wp('3%'),
    padding: wp('4.5%'),
    marginTop: hp('4%'),
    marginBottom: hp('3%'),
    marginHorizontal: 0,
    borderLeftWidth: 4,
    borderLeftColor: '#6c5ce7',
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: hp('0.25%') },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noticeTitle: {
    fontSize: RFValue(15),
    fontWeight: '700',
    color: '#6c5ce7',
    marginBottom: hp('1%'),
  },
  noticeText: {
    fontSize: RFValue(13),
    lineHeight: RFValue(20),
    color: '#4a5568',
  },
  lastUpdated: {
    alignItems: 'center',
    marginTop: hp('4%'),
    marginBottom: hp('2%'),
    paddingTop: hp('3%'),
    paddingHorizontal: wp('4%'),
    borderTopWidth: 1,
    borderTopColor: '#e1e4e8',
  },
  lastUpdatedText: {
    fontSize: RFValue(12),
    color: '#718096',
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: hp('4%'),
  },
});