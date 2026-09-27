import { ZENDESK_CONFIG } from '@/src/config/zendesk.config';
import React, { useState } from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { WebView } from 'react-native-webview';
import { RFValue } from '@/src/shared/utils/responsive';
import { LightHeader } from '@/src/shared/components/custom_components/lightCard';
import AppLoader from '@/src/shared/components/AppLoader';

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
    console.log('Message from Zendesk:', event.nativeEvent.data);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LightHeader solid title="Help & Support" onBack={onClose} backIcon="close" topPadding={Platform.OS === 'ios' ? 18 : 24} />

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <AppLoader size={32} color="#FFFFFF" />
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
              <AppLoader size={32} color="#FFFFFF" />
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
    backgroundColor: '#003399',
  },
  webview: {
    flex: 1,
    backgroundColor: '#003399',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#003399',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: RFValue(16),
    color: 'rgba(255,255,255,0.75)',
  },
});

export default ZendeskHelp;
