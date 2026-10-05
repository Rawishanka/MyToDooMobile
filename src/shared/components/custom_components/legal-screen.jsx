import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTheme } from '@/src/shared/theme';
import { BlueBackdrop, LightHeader, IconChip } from '@/src/shared/components/custom_components/lightCard';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LegalScreen = ({ onBack }) => {
  const { isDarkMode } = useTheme();
  const [currentScreen, setCurrentScreen] = useState('main');

  const BackButton = ({ onPress, title }) => (
    <LightHeader title={title} onBack={onPress} />
  );

  const MenuItem = ({ title, onPress, icon = 'document-text-outline' }) => (
    <TouchableOpacity
      style={[styles.menuItem, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <IconChip name={icon} style={{ marginRight: 12 }} />
      <Text style={[styles.menuText, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#94A3B8" : "rgba(255,255,255,0.6)"} />
    </TouchableOpacity>
  );

  const MainLegalScreen = () => (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <BlueBackdrop />
      <BackButton 
        onPress={onBack} 
        title="Legal"
      />
      
      <View style={styles.content}>
        <MenuItem 
          icon="shield-checkmark-outline"
          title="Privacy policy" 
          onPress={() => setCurrentScreen('privacy')}
        />
        <MenuItem 
          icon="document-text-outline"
          title="Terms & conditions" 
          onPress={() => setCurrentScreen('terms')}
        />
        <MenuItem 
          icon="code-slash-outline"
          title="Open source libraries" 
          onPress={() => setCurrentScreen('opensource')}
        />
      </View>
    </View>
  );

  const OpenSourceScreen = () => (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <BlueBackdrop />
      <BackButton 
        onPress={() => setCurrentScreen('main')} 
        title="Open source libraries"
      />
      
      <View style={styles.content}>
        <MenuItem icon="cube-outline" title="messagingapi_sdk_ios" onPress={() => {}} />
        <MenuItem icon="cube-outline" title="Moya" onPress={() => {}} />
        <MenuItem icon="cube-outline" title="nanopb" onPress={() => {}} />
        <MenuItem icon="cube-outline" title="nwwebsocket" onPress={() => {}} />
        <MenuItem icon="cube-outline" title="PLCrashReporter" onPress={() => {}} />
      </View>
    </View>
  );

  const TermsScreen = () => (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <BlueBackdrop />
      <BackButton 
        onPress={() => setCurrentScreen('main')} 
        title="Terms & conditions"
      />
      
      <ScrollView keyboardShouldPersistTaps="handled" style={styles.scrollContent} contentContainerStyle={styles.docScroll} showsVerticalScrollIndicator={true}>
        <View style={[styles.docCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
        <Text style={[styles.mainTitle, isDarkMode && { color: '#38BDF8' }]}>MyToDoo Terms and Conditions</Text>
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#38BDF8' }]}>1. Introduction</Text>
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>1.1 Agreement Overview</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          These Terms and Conditions ("Agreement") govern your access to and use of the MyToDoo website, mobile application and related services (together, the "Platform"). The Platform is operated by [Name of the Company] (ACN […………………]) ("MyToDoo", "we", "our" or "us").
        </Text>
        
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>1.2 Acceptance of Terms</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          By creating an account, posting a task, making or accepting an offer, or otherwise using the Platform, you agree to be bound by this Agreement, together with our Privacy Policy, Community Guidelines and any other policies published on the Platform (collectively, the "Policies"). If you do not agree, you must not use the Platform.
        </Text>
        
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>1.3 Nature of Platform</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          MyToDoo provides an online marketplace that allows registered users ("Users") to connect with one another for the purpose of offering and receiving services ("Tasks"). We are not a party to any contract for services between Users. Each contract for services is formed directly between the User who posts a task ("Poster") and the User who agrees to perform the task ("Tasker").
        </Text>
        
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>1.4 Policies Incorporated</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          All Policies referred to in this Agreement form part of this Agreement. We may update our Policies from time to time, and you agree to comply with them as updated.
        </Text>
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#38BDF8' }]}>2. Scope of Services</Text>
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>2.1 Marketplace Role</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          (a) MyToDoo provides the Platform as an online marketplace that enables Users to connect for the purpose of publishing, offering, and performing services ("Tasks").{'\n'}
          (b) MyToDoo does not itself perform Tasks and is not a party to any Task Contract between Users.{'\n'}
          (c) MyToDoo does not guarantee, endorse, or verify the quality, safety, legality, accuracy, or suitability of any Task, Posted Task, Offer, or Task Contract, nor the competence, qualifications, licences, insurance, or background of any User.{'\n'}
          (d) Each User is solely responsible for conducting their own due diligence before entering into a Task Contract.
        </Text>
        
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>2.2 Task Creation and Offers</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          (a) A User seeking services ("Poster") may create and publish a request for services on the Platform ("Posted Task"). Posters warrant that their Posted Tasks are accurate, complete, lawful, and do not breach any third-party rights.{'\n'}
          (b) Other Users ("Taskers") may respond by making an offer to perform the Task ("Offer"). Taskers warrant that they are competent, qualified, licensed, and insured (where required) to perform the Task safely and lawfully.{'\n'}
          (c) When a Poster accepts an Offer, a separate binding contract ("Task Contract") is formed directly between the Poster and Tasker.{'\n'}
          (d) MyToDoo may, at its discretion and without liability, reject, suspend, or remove any Posted Task or Offer.
        </Text>
        
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>2.3 No Agency Relationship</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          Nothing in this Agreement creates any employment, agency, partnership, fiduciary, joint venture, or other relationship between MyToDoo and any User. Users act in their own capacity and as independent contractors.
        </Text>
        
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>2.5 Prohibited Tasks</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          Users must not use the Platform to post, offer, or request:{'\n'}
          (a) unlawful, fraudulent, or illegal activities;{'\n'}
          (b) services requiring a licence that the Tasker does not hold;{'\n'}
          (c) services involving hazardous materials unless properly licensed;{'\n'}
          (d) services in regulated industries unless duly authorised;{'\n'}
          (e) services that infringe intellectual property rights;{'\n'}
          (f) off-platform or cash payments;{'\n'}
          (g) any other service MyToDoo considers inappropriate.
        </Text>
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#38BDF8' }]}>3. User Accounts & Eligibility</Text>
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>3.1 Account Creation</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          (a) To access and use the Platform, you must register for an account and provide accurate, current and complete information.{'\n'}
          (b) You must keep your login credentials secure. You are responsible for all activity conducted under your account.{'\n'}
          (c) You must immediately notify MyToDoo of any unauthorised use of your account.
        </Text>
        
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>3.2 Eligibility</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          (a) You must be at least 18 years of age and have the legal capacity to enter into binding contracts.{'\n'}
          (b) By creating an account, you warrant that you meet all eligibility requirements.
        </Text>
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#38BDF8' }]}>4. Posting and Accepting Tasks</Text>
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>4.1 Creating a Posted Task</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          (a) A User seeking services ("Poster") may create and publish a request for services on the Platform.{'\n'}
          (b) A Posted Task must include sufficient detail to allow Taskers to make an informed Offer.{'\n'}
          (c) A Poster must not post any Task that is unlawful, misleading, or contrary to this Agreement.
        </Text>
        
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>4.3 Acceptance and Task Contract</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          (a) When a Poster accepts a Tasker's Offer, a separate contract ("Task Contract") is formed directly between the Poster and the Tasker.{'\n'}
          (b) MyToDoo is not a party to any Task Contract and has no responsibility for the performance of services.
        </Text>
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#38BDF8' }]}>5. Payments and Escrow</Text>
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>5.1 Payment Process</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          (a) When a Poster accepts a Tasker's Offer, the Poster must pay the agreed price for the Task together with any applicable fees into the Payment Account operated by our payment provider, Stripe.{'\n'}
          (b) The Agreed Price is held in escrow by Stripe until the Task is completed.
        </Text>
        
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>5.2 Release of Funds</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          (a) Once the Tasker has marked the Task as complete, the Poster will be notified and must confirm whether the Task has been completed satisfactorily.{'\n'}
          (b) If the Poster confirms completion, the Tasker Funds will be released to the Tasker.{'\n'}
          (c) If the Poster does not confirm completion within 30 days, the Task will be deemed completed and funds will be automatically released.
        </Text>
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#38BDF8' }]}>6. Fees and Charges</Text>
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>6.1 Types of Fees</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          The following fees apply:{'\n'}
          (a) Connection Fee – payable by the Poster when accepting an Offer (non-refundable).{'\n'}
          (b) Tasker Service Fee – deducted from the Agreed Price before release to the Tasker.{'\n'}
          (c) Transaction Fees – additional fees required to process payments.
        </Text>
        
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>6.3 Tasker Service Fee – Tiered Structure</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          Grasshopper – less than $799: 15% + GST{'\n'}
          P-Plater – $800 to $2,499: 13% + GST{'\n'}
          Expert – $2,500 to $4,999: 11% + GST{'\n'}
          Grandmaster – $5,000 or more: 9% + GST
        </Text>
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#38BDF8' }]}>7. Refunds, Cancellations and Credits</Text>
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>7.1 Non-Refundable Fees</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          The Connection Fee is non-refundable in all circumstances, except where required by the Australian Consumer Law.
        </Text>
        
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>7.6 MyToDoo Credits</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          (a) MyToDoo Credits represent prepaid value that may be used to pay for future Tasks.{'\n'}
          (b) Credits are not redeemable for cash, except where required by law.{'\n'}
          (c) Credits will have a minimum expiry period of 3 years from the date of issue.
        </Text>
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#38BDF8' }]}>8. Insurance and Risk Allocation</Text>
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>8.1 No Insurance Provided by MyToDoo</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          MyToDoo does not provide any form of insurance to Users. MyToDoo is not responsible for ensuring that any Tasker or Poster holds appropriate insurance.
        </Text>
        
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>8.2 User Responsibility for Insurance</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          Taskers are solely responsible for obtaining and maintaining all insurance necessary to perform Tasks, including public liability and workers' compensation.
        </Text>
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#38BDF8' }]}>9. Verification, Badges and Trust</Text>
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>9.1 Identity Verification</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          MyToDoo may require Users to verify their identity through third-party providers, including RatifyID and other verification services.
        </Text>
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#38BDF8' }]}>10. User Obligations and Conduct</Text>
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>10.4 Prohibited Conduct</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          You must not:{'\n'}
          (a) post or accept any unlawful or unsafe Task;{'\n'}
          (b) provide false, misleading or deceptive information;{'\n'}
          (c) infringe the intellectual property or privacy rights of others;{'\n'}
          (d) harass, abuse, threaten or defame any person;{'\n'}
          (e) engage in fraudulent activity;{'\n'}
          (f) attempt to solicit or negotiate payment outside the Platform.
        </Text>
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#38BDF8' }]}>11. Dispute Resolution and Cancellations</Text>
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>11.1 Platform's Limited Role in Disputes</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          MyToDoo is not a party to any Task Contract formed between Users. MyToDoo has no obligation to monitor, mediate, arbitrate, or resolve disputes between Users.
        </Text>
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#38BDF8' }]}>12. Privacy and Data Protection</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          MyToDoo respects your privacy and is committed to handling personal information in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles.
        </Text>
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#38BDF8' }]}>13. Termination and Suspension</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          MyToDoo may suspend, restrict or terminate your account at any time if you breach this Agreement or engage in unlawful, fraudulent or harmful conduct.
        </Text>
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#38BDF8' }]}>14. Intellectual Property</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          All intellectual property rights in the Platform are owned by or licensed to MyToDoo. You are granted a limited, non-exclusive, revocable licence to use the Platform.
        </Text>
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#38BDF8' }]}>15. Liability and Indemnity</Text>
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>15.1 No Responsibility for User Conduct</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          MyToDoo provides the Platform as a marketplace only and does not control, supervise or direct the actions of Users.
        </Text>
        
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>15.4 Non-Excludable Guarantees (ACL)</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          Nothing in this Agreement excludes, restricts or modifies any consumer guarantee, right or remedy under the Australian Consumer Law.
        </Text>
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#38BDF8' }]}>16. Amendments to Terms</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          MyToDoo may amend, update or replace this Agreement at any time. You will be notified of material amendments by email or Platform notification.
        </Text>
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#38BDF8' }]}>17. Notices</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          Any notice required under this Agreement must be in writing and may be delivered by email, electronic message through the Platform, or prepaid ordinary post.
        </Text>
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#38BDF8' }]}>18. General Provisions</Text>
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>18.12 Governing Law and Jurisdiction</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          (a) This Agreement is governed by the laws of the Australian Capital Territory, Australia.{'\n'}
          (b) Users have the right to be protected under the laws where the Task is performed in accordance with the laws of such jurisdiction.
        </Text>
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#38BDF8' }]}>19. Definitions</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          "Agreed Price" means the total price agreed between a Poster and a Tasker for a Task.{'\n'}
          "Connection Fee" means the fee payable by a Poster when accepting a Tasker's Offer.{'\n'}
          "Poster" means a User who posts a Task on the Platform.{'\n'}
          "Tasker" means a User who offers and performs services for Posters.{'\n'}
          "Task Contract" means the contract formed directly between a Poster and a Tasker.
        </Text>
        
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#38BDF8' }]}>20. Community Guidelines and Closing</Text>
        <Text style={[styles.subSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>20.3 Acknowledgement</Text>
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          By creating an account, posting a Task, making or accepting an Offer, or otherwise using the Platform, you acknowledge that you:{'\n'}
          (a) have read and understood this Agreement;{'\n'}
          (b) agree to be bound by its terms; and{'\n'}
          (c) consent to receiving notices and communications in electronic form.
        </Text>
        
        <Text style={[styles.lastUpdated, isDarkMode && { color: '#94A3B8' }]}>
          Last updated: November 2025
        </Text>
        
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          For questions about these terms, please contact us through the Platform support channels.
        </Text>
        
        </View>

        <TouchableOpacity style={styles.acceptButton} activeOpacity={0.85}>
          <Text style={styles.acceptButtonText}>Accept updated terms</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const PrivacyScreen = () => (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B1120' }]}>
      <BlueBackdrop />
      <LightHeader title="Privacy policy" onBack={() => setCurrentScreen('main')} />

      <ScrollView keyboardShouldPersistTaps="handled" style={styles.scrollContent} contentContainerStyle={styles.docScroll}>
        <View style={[styles.docCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>Airtasker</Text>
        </View>
        
        <Text style={[styles.privacyTitle, isDarkMode && { color: '#F8FAFC' }]}>Privacy policy</Text>
        
        <Text style={[styles.lastUpdated, isDarkMode && { color: '#94A3B8' }]}>
          This Privacy Policy was last updated on 26 September 2024.
        </Text>
        
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          Airtasker manages the information that we collect from you in accordance with applicable 
          privacy legislation. In this Privacy Policy, "Airtasker", "we", "our" and/or "us" means:
        </Text>
        
        <Text style={[styles.listItem, isDarkMode && { color: '#94A3B8' }]}>
          • (i) where you reside in any country in the European Economic Area or the United 
          Kingdom, Airtasker UK Limited; and
        </Text>
        
        <Text style={[styles.listItem, isDarkMode && { color: '#94A3B8' }]}>
          • (ii) where you reside anywhere outside the European Economic Area and the United 
          Kingdom, Airtasker Limited, an Australian company.
        </Text>
        
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          Company details for each of the Airtasker companies is set out in the Contact Us section 
          below.
        </Text>
        
        <Text style={[styles.paragraph, isDarkMode && { color: '#94A3B8' }]}>
          This Privacy Policy describes how Airtasker collects, uses, shares and handles your personal
        </Text>
        </View>
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
    backgroundColor: '#003399',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scrollContent: {
    flex: 1,
  },
  docScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  docCard: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 12,
    shadowColor: '#00114D',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#00114D',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 16,
  },
  privacyTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 16,
  },
  link: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  userAgreement: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  listItem: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 12,
    paddingLeft: 16,
  },
  acceptButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 8,
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  brandContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  brandText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  lastUpdated: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 22,
    marginBottom: 10,
  },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 14,
    marginBottom: 6,
  },
});

export default LegalScreen;
