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

interface TermsConditionsScreenProps {
  onBack?: () => void;
}

export default function TermsConditionsScreen({ onBack }: TermsConditionsScreenProps) {
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
        <Text style={styles.headerTitle} numberOfLines={1}>Terms & Conditions</Text>
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
            <Text style={styles.sectionTitle}>Introduction</Text>
          </View>
          
          <Text style={styles.bodyText}>
            These Terms and Conditions govern your use of the MyToDoo platform. By creating an account or using our services, you agree to these terms, including our Privacy Policy and Community Guidelines.
          </Text>

          <Text style={styles.bodyText}>
            MyToDoo is an online marketplace connecting users who post tasks ("Posters") with users who complete them ("Taskers"). We facilitate connections but are not party to contracts between users.
          </Text>

          {/* Scope of Services */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>2.</Text>
            <Text style={styles.sectionTitle}>Platform Services</Text>
          </View>

          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>MyToDoo provides a marketplace for posting and completing tasks</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>We don't guarantee task quality or verify user qualifications</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Users are responsible for their own due diligence</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Tasks must be accurate, lawful, and comply with our policies</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Accepting an offer creates a binding contract between users</Text>
          </View>

          {/* User Accounts */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>3.</Text>
            <Text style={styles.sectionTitle}>Your Account</Text>
          </View>

          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>You must be at least 18 years old to use MyToDoo</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Provide accurate and complete registration information</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Keep your login credentials secure and confidential</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>You're responsible for all activity under your account</Text>
          </View>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bodyText}>Report any unauthorized access immediately</Text>
          </View>

          {/* Important Notice */}
          <View style={styles.noticeContainer}>
            <Text style={styles.noticeTitle}>📋 Important Notice</Text>
            <Text style={styles.noticeText}>
              This is a condensed version of our Terms & Conditions. The full document contains additional important sections covering payments, fees, insurance, liability, dispute resolution, and other essential terms. By using MyToDoo, you agree to be bound by all terms in the complete agreement.
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
    color: '#0052A2',
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
    color: '#0052A2',
    marginRight: wp('2.5%'),
    marginTop: hp('0.25%'),
    fontWeight: '600',
  },
  noticeContainer: {
    backgroundColor: '#E8F2FF',
    borderRadius: wp('3%'),
    padding: wp('4.5%'),
    marginTop: hp('4%'),
    marginBottom: hp('3%'),
    marginHorizontal: 0,
    borderLeftWidth: 4,
    borderLeftColor: '#0052A2',
    shadowColor: '#0052A2',
    shadowOffset: { width: 0, height: hp('0.25%') },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noticeTitle: {
    fontSize: RFValue(15),
    fontWeight: '700',
    color: '#0052A2',
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