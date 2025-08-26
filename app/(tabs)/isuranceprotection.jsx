import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function InsuranceProtection({ onBack }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#003366" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Insurance protection</Text>
      </View>

      <View style={styles.content}>
        {/* Main Insurance Notice */}
        <View style={styles.insuranceNotice}>
          <Text style={styles.insuranceTitle}>
            Airtasker Insurance including Terms & Conditions have been updated as of July 1, 2024.
          </Text>
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryText}>
            Please note this is a summary of the Airtasker third party liability insurance policy ONLY.
          </Text>
        </View>

        {/* Disclaimer Section */}
        <View style={styles.disclaimerSection}>
          <Text style={styles.disclaimerText}>
            Nothing contained herein is general or personal advice. Furthermore, it is declared and agreed that nothing contained in this summary should be understood to be an implied condition, term or exclusion which forms part of the Insurer Policy terms and conditions or be relied upon in the event of a Claim. Please contact Airtasker for access to the Certificate of Currency and/or Insurance Policy Schedule and/or Policy Wording for information as to the specific coverage, terms, conditions and exclusions afforded by the Insurer Policy and an understanding of such. Please review the{' '}
            <Text style={styles.linkText}>Privacy Policy</Text> and{' '}
            <Text style={styles.linkText}>Terms and Conditions</Text> for full details.
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Need help?</Text>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="mail-outline" size={20} color="#0052A2" />
            <Text style={styles.contactButtonText}>Contact Airtasker Support</Text>
          </TouchableOpacity>
        </View>

        {/* Important Notice */}
        <View style={styles.importantNotice}>
          <View style={styles.warningIcon}>
            <Ionicons name="warning-outline" size={24} color="#FF6B35" />
          </View>
          <Text style={styles.warningText}>
            This information is provided for reference only. Always refer to the official policy documents for complete terms and conditions.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#003366',
    marginLeft: 12,
  },
  content: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  insuranceNotice: {
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  insuranceTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#003366',
    lineHeight: 28,
  },
  summarySection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontWeight: '500',
  },
  disclaimerSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  disclaimerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  linkText: {
    color: '#0052A2',
    textDecorationLine: 'underline',
  },
  contactSection: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003366',
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0052A2',
  },
  contactButtonText: {
    fontSize: 15,
    color: '#0052A2',
    marginLeft: 8,
    fontWeight: '500',
  },
  importantNotice: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  warningIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  warningText: {
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
    flex: 1,
  },
});