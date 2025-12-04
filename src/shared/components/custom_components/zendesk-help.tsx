import { ZENDESK_CONFIG } from '@/src/config/zendesk.config';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { WebView } from 'react-native-webview';

interface ZendeskHelpProps {
  visible: boolean;
  onClose: () => void;
}

const ZendeskHelp: React.FC<ZendeskHelpProps> = ({ visible, onClose }) => {
  const [loading, setLoading] = useState(true);
  
  // Get Zendesk URL from config
  const ZENDESK_URL = ZENDESK_CONFIG.helpCenterUrl;

  const handleMessage = (event: any) => {
    // Handle messages from Zendesk if needed
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#0052A2" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0052A2" />
            <Text style={styles.loadingText}>Loading Help Center...</Text>
          </View>
        )}

        {/* Zendesk WebView */}
        <WebView
          source={{ uri: ZENDESK_URL }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onMessage={handleMessage}
          // Enable JavaScript for better functionality
          javaScriptEnabled={true}
          // Enable DOM storage
          domStorageEnabled={true}
          // Start in loading state
          startInLoadingState={true}
          // Allow inline media playback
          allowsInlineMediaPlayback={true}
          // Enable scrolling
          scrollEnabled={true}
          // Show loading view
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0052A2" />
            </View>
          )}
        />
      </View>
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
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0052A2',
  },
  placeholder: {
    width: 32,
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default ZendeskHelp;
