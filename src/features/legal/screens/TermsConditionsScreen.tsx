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

export default function TermsConditionsScreen() {
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
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
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
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>1.</Text>
            <Text style={styles.sectionTitle}>Introduction</Text>
          </View>
          
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>1.1 Agreement Overview</Text>
            <Text style={styles.bodyText}>
              These Terms and Conditions ("Agreement") govern your access to and use of the MyToDoo website, mobile application and related services (together, the "Platform"). The Platform is operated by [Name of the Company] (ACN […………………]) ("MyToDoo", "we", "our" or "us").
            </Text>
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>1.2 Acceptance of Terms</Text>
            <Text style={styles.bodyText}>
              By creating an account, posting a task, making or accepting an offer, or otherwise using the Platform, you agree to be bound by this Agreement, together with our Privacy Policy, Community Guidelines and any other policies published on the Platform (collectively, the "Policies"). If you do not agree, you must not use the Platform.
            </Text>
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>1.3 Nature of Platform</Text>
            <Text style={styles.bodyText}>
              MyToDoo provides an online marketplace that allows registered users ("Users") to connect with one another for the purpose of offering and receiving services ("Tasks"). We are not a party to any contract for services between Users. Each contract for services is formed directly between the User who posts a task ("Poster") and the User who agrees to perform the task ("Tasker").
            </Text>
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>1.4 Policies Incorporated</Text>
            <Text style={styles.bodyText}>
              All Policies referred to in this Agreement form part of this Agreement. We may update our Policies from time to time, and you agree to comply with them as updated.
            </Text>
          </View>

          {/* Scope of Services */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>2.</Text>
            <Text style={styles.sectionTitle}>Scope of Services</Text>
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>2.1 Marketplace Role</Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>(a)</Text>
              <Text style={styles.bodyText}>MyToDoo provides the Platform as an online marketplace that enables Users to connect for the purpose of publishing, offering, and performing services ("Tasks").</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>(b)</Text>
              <Text style={styles.bodyText}>MyToDoo does not itself perform Tasks and is not a party to any Task Contract between Users.</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>(c)</Text>
              <Text style={styles.bodyText}>MyToDoo does not guarantee, endorse, or verify the quality, safety, legality, accuracy, or suitability of any Task, Posted Task, Offer, or Task Contract, nor the competence, qualifications, licences, insurance, or background of any User.</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>(d)</Text>
              <Text style={styles.bodyText}>Each User is solely responsible for conducting their own due diligence before entering into a Task Contract.</Text>
            </View>
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>2.2 Task Creation and Offers</Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>(a)</Text>
              <Text style={styles.bodyText}>A User seeking services ("Poster") may create and publish a request for services on the Platform ("Posted Task"). Posters warrant that their Posted Tasks are accurate, complete, lawful, and do not breach any third-party rights.</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>(b)</Text>
              <Text style={styles.bodyText}>Other Users ("Taskers") may respond by making an offer to perform the Task ("Offer"). Taskers warrant that they are competent, qualified, licensed, and insured (where required) to perform the Task safely and lawfully.</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>(c)</Text>
              <Text style={styles.bodyText}>When a Poster accepts an Offer, a separate binding contract ("Task Contract") is formed directly between the Poster and Tasker. The Task Contract incorporates the terms of this Agreement and any additional terms expressly agreed between those Users through the Platform.</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>(d)</Text>
              <Text style={styles.bodyText}>MyToDoo may, at its discretion and without liability, reject, suspend, or remove any Posted Task or Offer that it considers misleading, inappropriate, unlawful, or otherwise unsuitable for the Platform.</Text>
            </View>
          </View>

          {/* User Accounts & Eligibility */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>3.</Text>
            <Text style={styles.sectionTitle}>User Accounts & Eligibility</Text>
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>3.1 Account Creation</Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>(a)</Text>
              <Text style={styles.bodyText}>To access and use the Platform, you must register for an account and provide accurate, current and complete information.</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>(b)</Text>
              <Text style={styles.bodyText}>You must keep your login credentials secure. You are responsible for all activity conducted under your account, whether authorised by you or not.</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>(c)</Text>
              <Text style={styles.bodyText}>You must immediately notify MyToDoo of any unauthorised use of your account or suspected security breach.</Text>
            </View>
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>3.2 Eligibility</Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>(a)</Text>
              <Text style={styles.bodyText}>You must be at least 18 years of age and have the legal capacity to enter into binding contracts.</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>(b)</Text>
              <Text style={styles.bodyText}>By creating an account, you warrant that you meet all eligibility requirements and that any information provided by you is true, complete, and not misleading.</Text>
            </View>
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
  section: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    marginTop: 24,
  },
  sectionNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    marginRight: 8,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  subsection: {
    marginBottom: 16,
    marginLeft: 28,
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
    flex: 1,
  },
  bulletContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 14,
    color: '#555',
    marginRight: 8,
    marginTop: 1,
    minWidth: 20,
  },
  noticeContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 32,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
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