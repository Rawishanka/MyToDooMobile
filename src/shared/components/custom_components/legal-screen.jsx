import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
      
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={true}>
        <Text style={styles.mainTitle}>MyToDoo Terms and Conditions</Text>
        
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.subSectionTitle}>1.1 Agreement Overview</Text>
        <Text style={styles.paragraph}>
          These Terms and Conditions ("Agreement") govern your access to and use of the MyToDoo website, mobile application and related services (together, the "Platform"). The Platform is operated by [Name of the Company] (ACN […………………]) ("MyToDoo", "we", "our" or "us").
        </Text>
        
        <Text style={styles.subSectionTitle}>1.2 Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By creating an account, posting a task, making or accepting an offer, or otherwise using the Platform, you agree to be bound by this Agreement, together with our Privacy Policy, Community Guidelines and any other policies published on the Platform (collectively, the "Policies"). If you do not agree, you must not use the Platform.
        </Text>
        
        <Text style={styles.subSectionTitle}>1.3 Nature of Platform</Text>
        <Text style={styles.paragraph}>
          MyToDoo provides an online marketplace that allows registered users ("Users") to connect with one another for the purpose of offering and receiving services ("Tasks"). We are not a party to any contract for services between Users. Each contract for services is formed directly between the User who posts a task ("Poster") and the User who agrees to perform the task ("Tasker").
        </Text>
        
        <Text style={styles.subSectionTitle}>1.4 Policies Incorporated</Text>
        <Text style={styles.paragraph}>
          All Policies referred to in this Agreement form part of this Agreement. We may update our Policies from time to time, and you agree to comply with them as updated.
        </Text>
        
        <Text style={styles.sectionTitle}>2. Scope of Services</Text>
        <Text style={styles.subSectionTitle}>2.1 Marketplace Role</Text>
        <Text style={styles.paragraph}>
          (a) MyToDoo provides the Platform as an online marketplace that enables Users to connect for the purpose of publishing, offering, and performing services ("Tasks").{'\n'}
          (b) MyToDoo does not itself perform Tasks and is not a party to any Task Contract between Users.{'\n'}
          (c) MyToDoo does not guarantee, endorse, or verify the quality, safety, legality, accuracy, or suitability of any Task, Posted Task, Offer, or Task Contract, nor the competence, qualifications, licences, insurance, or background of any User.{'\n'}
          (d) Each User is solely responsible for conducting their own due diligence before entering into a Task Contract.
        </Text>
        
        <Text style={styles.subSectionTitle}>2.2 Task Creation and Offers</Text>
        <Text style={styles.paragraph}>
          (a) A User seeking services ("Poster") may create and publish a request for services on the Platform ("Posted Task"). Posters warrant that their Posted Tasks are accurate, complete, lawful, and do not breach any third-party rights.{'\n'}
          (b) Other Users ("Taskers") may respond by making an offer to perform the Task ("Offer"). Taskers warrant that they are competent, qualified, licensed, and insured (where required) to perform the Task safely and lawfully.{'\n'}
          (c) When a Poster accepts an Offer, a separate binding contract ("Task Contract") is formed directly between the Poster and Tasker.{'\n'}
          (d) MyToDoo may, at its discretion and without liability, reject, suspend, or remove any Posted Task or Offer.
        </Text>
        
        <Text style={styles.subSectionTitle}>2.3 No Agency Relationship</Text>
        <Text style={styles.paragraph}>
          Nothing in this Agreement creates any employment, agency, partnership, fiduciary, joint venture, or other relationship between MyToDoo and any User. Users act in their own capacity and as independent contractors.
        </Text>
        
        <Text style={styles.subSectionTitle}>2.5 Prohibited Tasks</Text>
        <Text style={styles.paragraph}>
          Users must not use the Platform to post, offer, or request:{'\n'}
          (a) unlawful, fraudulent, or illegal activities;{'\n'}
          (b) services requiring a licence that the Tasker does not hold;{'\n'}
          (c) services involving hazardous materials unless properly licensed;{'\n'}
          (d) services in regulated industries unless duly authorised;{'\n'}
          (e) services that infringe intellectual property rights;{'\n'}
          (f) off-platform or cash payments;{'\n'}
          (g) any other service MyToDoo considers inappropriate.
        </Text>
        
        <Text style={styles.sectionTitle}>3. User Accounts & Eligibility</Text>
        <Text style={styles.subSectionTitle}>3.1 Account Creation</Text>
        <Text style={styles.paragraph}>
          (a) To access and use the Platform, you must register for an account and provide accurate, current and complete information.{'\n'}
          (b) You must keep your login credentials secure. You are responsible for all activity conducted under your account.{'\n'}
          (c) You must immediately notify MyToDoo of any unauthorised use of your account.
        </Text>
        
        <Text style={styles.subSectionTitle}>3.2 Eligibility</Text>
        <Text style={styles.paragraph}>
          (a) You must be at least 18 years of age and have the legal capacity to enter into binding contracts.{'\n'}
          (b) By creating an account, you warrant that you meet all eligibility requirements.
        </Text>
        
        <Text style={styles.sectionTitle}>4. Posting and Accepting Tasks</Text>
        <Text style={styles.subSectionTitle}>4.1 Creating a Posted Task</Text>
        <Text style={styles.paragraph}>
          (a) A User seeking services ("Poster") may create and publish a request for services on the Platform.{'\n'}
          (b) A Posted Task must include sufficient detail to allow Taskers to make an informed Offer.{'\n'}
          (c) A Poster must not post any Task that is unlawful, misleading, or contrary to this Agreement.
        </Text>
        
        <Text style={styles.subSectionTitle}>4.3 Acceptance and Task Contract</Text>
        <Text style={styles.paragraph}>
          (a) When a Poster accepts a Tasker's Offer, a separate contract ("Task Contract") is formed directly between the Poster and the Tasker.{'\n'}
          (b) MyToDoo is not a party to any Task Contract and has no responsibility for the performance of services.
        </Text>
        
        <Text style={styles.sectionTitle}>5. Payments and Escrow</Text>
        <Text style={styles.subSectionTitle}>5.1 Payment Process</Text>
        <Text style={styles.paragraph}>
          (a) When a Poster accepts a Tasker's Offer, the Poster must pay the agreed price for the Task together with any applicable fees into the Payment Account operated by our payment provider, Stripe.{'\n'}
          (b) The Agreed Price is held in escrow by Stripe until the Task is completed.
        </Text>
        
        <Text style={styles.subSectionTitle}>5.2 Release of Funds</Text>
        <Text style={styles.paragraph}>
          (a) Once the Tasker has marked the Task as complete, the Poster will be notified and must confirm whether the Task has been completed satisfactorily.{'\n'}
          (b) If the Poster confirms completion, the Tasker Funds will be released to the Tasker.{'\n'}
          (c) If the Poster does not confirm completion within 30 days, the Task will be deemed completed and funds will be automatically released.
        </Text>
        
        <Text style={styles.sectionTitle}>6. Fees and Charges</Text>
        <Text style={styles.subSectionTitle}>6.1 Types of Fees</Text>
        <Text style={styles.paragraph}>
          The following fees apply:{'\n'}
          (a) Connection Fee – payable by the Poster when accepting an Offer (non-refundable).{'\n'}
          (b) Tasker Service Fee – deducted from the Agreed Price before release to the Tasker.{'\n'}
          (c) Transaction Fees – additional fees required to process payments.
        </Text>
        
        <Text style={styles.subSectionTitle}>6.3 Tasker Service Fee – Tiered Structure</Text>
        <Text style={styles.paragraph}>
          Grasshopper – less than $799: 15% + GST{'\n'}
          P-Plater – $800 to $2,499: 13% + GST{'\n'}
          Expert – $2,500 to $4,999: 11% + GST{'\n'}
          Grandmaster – $5,000 or more: 9% + GST
        </Text>
        
        <Text style={styles.sectionTitle}>7. Refunds, Cancellations and Credits</Text>
        <Text style={styles.subSectionTitle}>7.1 Non-Refundable Fees</Text>
        <Text style={styles.paragraph}>
          The Connection Fee is non-refundable in all circumstances, except where required by the Australian Consumer Law.
        </Text>
        
        <Text style={styles.subSectionTitle}>7.6 MyToDoo Credits</Text>
        <Text style={styles.paragraph}>
          (a) MyToDoo Credits represent prepaid value that may be used to pay for future Tasks.{'\n'}
          (b) Credits are not redeemable for cash, except where required by law.{'\n'}
          (c) Credits will have a minimum expiry period of 3 years from the date of issue.
        </Text>
        
        <Text style={styles.sectionTitle}>8. Insurance and Risk Allocation</Text>
        <Text style={styles.subSectionTitle}>8.1 No Insurance Provided by MyToDoo</Text>
        <Text style={styles.paragraph}>
          MyToDoo does not provide any form of insurance to Users. MyToDoo is not responsible for ensuring that any Tasker or Poster holds appropriate insurance.
        </Text>
        
        <Text style={styles.subSectionTitle}>8.2 User Responsibility for Insurance</Text>
        <Text style={styles.paragraph}>
          Taskers are solely responsible for obtaining and maintaining all insurance necessary to perform Tasks, including public liability and workers' compensation.
        </Text>
        
        <Text style={styles.sectionTitle}>9. Verification, Badges and Trust</Text>
        <Text style={styles.subSectionTitle}>9.1 Identity Verification</Text>
        <Text style={styles.paragraph}>
          MyToDoo may require Users to verify their identity through third-party providers, including RatifyID and other verification services.
        </Text>
        
        <Text style={styles.sectionTitle}>10. User Obligations and Conduct</Text>
        <Text style={styles.subSectionTitle}>10.4 Prohibited Conduct</Text>
        <Text style={styles.paragraph}>
          You must not:{'\n'}
          (a) post or accept any unlawful or unsafe Task;{'\n'}
          (b) provide false, misleading or deceptive information;{'\n'}
          (c) infringe the intellectual property or privacy rights of others;{'\n'}
          (d) harass, abuse, threaten or defame any person;{'\n'}
          (e) engage in fraudulent activity;{'\n'}
          (f) attempt to solicit or negotiate payment outside the Platform.
        </Text>
        
        <Text style={styles.sectionTitle}>11. Dispute Resolution and Cancellations</Text>
        <Text style={styles.subSectionTitle}>11.1 Platform's Limited Role in Disputes</Text>
        <Text style={styles.paragraph}>
          MyToDoo is not a party to any Task Contract formed between Users. MyToDoo has no obligation to monitor, mediate, arbitrate, or resolve disputes between Users.
        </Text>
        
        <Text style={styles.sectionTitle}>12. Privacy and Data Protection</Text>
        <Text style={styles.paragraph}>
          MyToDoo respects your privacy and is committed to handling personal information in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles.
        </Text>
        
        <Text style={styles.sectionTitle}>13. Termination and Suspension</Text>
        <Text style={styles.paragraph}>
          MyToDoo may suspend, restrict or terminate your account at any time if you breach this Agreement or engage in unlawful, fraudulent or harmful conduct.
        </Text>
        
        <Text style={styles.sectionTitle}>14. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          All intellectual property rights in the Platform are owned by or licensed to MyToDoo. You are granted a limited, non-exclusive, revocable licence to use the Platform.
        </Text>
        
        <Text style={styles.sectionTitle}>15. Liability and Indemnity</Text>
        <Text style={styles.subSectionTitle}>15.1 No Responsibility for User Conduct</Text>
        <Text style={styles.paragraph}>
          MyToDoo provides the Platform as a marketplace only and does not control, supervise or direct the actions of Users.
        </Text>
        
        <Text style={styles.subSectionTitle}>15.4 Non-Excludable Guarantees (ACL)</Text>
        <Text style={styles.paragraph}>
          Nothing in this Agreement excludes, restricts or modifies any consumer guarantee, right or remedy under the Australian Consumer Law.
        </Text>
        
        <Text style={styles.sectionTitle}>16. Amendments to Terms</Text>
        <Text style={styles.paragraph}>
          MyToDoo may amend, update or replace this Agreement at any time. You will be notified of material amendments by email or Platform notification.
        </Text>
        
        <Text style={styles.sectionTitle}>17. Notices</Text>
        <Text style={styles.paragraph}>
          Any notice required under this Agreement must be in writing and may be delivered by email, electronic message through the Platform, or prepaid ordinary post.
        </Text>
        
        <Text style={styles.sectionTitle}>18. General Provisions</Text>
        <Text style={styles.subSectionTitle}>18.12 Governing Law and Jurisdiction</Text>
        <Text style={styles.paragraph}>
          (a) This Agreement is governed by the laws of the Australian Capital Territory, Australia.{'\n'}
          (b) Users have the right to be protected under the laws where the Task is performed in accordance with the laws of such jurisdiction.
        </Text>
        
        <Text style={styles.sectionTitle}>19. Definitions</Text>
        <Text style={styles.paragraph}>
          "Agreed Price" means the total price agreed between a Poster and a Tasker for a Task.{'\n'}
          "Connection Fee" means the fee payable by a Poster when accepting a Tasker's Offer.{'\n'}
          "Poster" means a User who posts a Task on the Platform.{'\n'}
          "Tasker" means a User who offers and performs services for Posters.{'\n'}
          "Task Contract" means the contract formed directly between a Poster and a Tasker.
        </Text>
        
        <Text style={styles.sectionTitle}>20. Community Guidelines and Closing</Text>
        <Text style={styles.subSectionTitle}>20.3 Acknowledgement</Text>
        <Text style={styles.paragraph}>
          By creating an account, posting a Task, making or accepting an Offer, or otherwise using the Platform, you acknowledge that you:{'\n'}
          (a) have read and understood this Agreement;{'\n'}
          (b) agree to be bound by its terms; and{'\n'}
          (c) consent to receiving notices and communications in electronic form.
        </Text>
        
        <Text style={styles.lastUpdated}>
          Last updated: November 2025
        </Text>
        
        <Text style={styles.paragraph}>
          For questions about these terms, please contact us through the Platform support channels.
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
    paddingTop: (StatusBar.currentHeight || 0) + 12,
    paddingBottom: 12,
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
    fontSize: 23,
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
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginTop: 24,
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
});

export default LegalScreen;