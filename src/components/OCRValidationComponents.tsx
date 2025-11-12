import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { OCRValidationResult } from '../services/ocrValidationService';

/**
 * Props for OCR Validation components
 */
interface OCRValidationModalProps {
  visible: boolean;
  onClose: () => void;
  onRetry: () => void;
  onSkip?: () => void;
  validationResult: OCRValidationResult | null;
  isProcessing: boolean;
  imageName?: string;
}

interface OCRValidationBannerProps {
  validationResult: OCRValidationResult;
  onDismiss: () => void;
  onRetry?: () => void;
  compact?: boolean;
}

interface ValidationProgressProps {
  currentImage: number;
  totalImages: number;
  currentImageName?: string;
}

/**
 * Modal for displaying detailed OCR validation results
 */
export const OCRValidationModal: React.FC<OCRValidationModalProps> = ({
  visible,
  onClose,
  onRetry,
  onSkip,
  validationResult,
  isProcessing,
  imageName = 'image'
}) => {
  const renderProcessingState = () => (
    <View style={styles.modalContent}>
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.processingTitle}>Analyzing Image...</Text>
        <Text style={styles.processingSubtitle}>
          Using OCR to verify image content relevance
        </Text>
      </View>
    </View>
  );

  const renderValidationResult = () => {
    if (!validationResult) return null;

    return (
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={[
          styles.resultHeader,
          validationResult.isValid ? styles.successHeader : styles.errorHeader
        ]}>
          <Ionicons
            name={validationResult.isValid ? "checkmark-circle" : "alert-circle"}
            size={24}
            color="white"
          />
          <Text style={styles.resultHeaderText}>
            {validationResult.isValid ? 'Image Approved' : 'Image Validation Failed'}
          </Text>
        </View>

        <ScrollView style={styles.resultContent} showsVerticalScrollIndicator={false}>
          {/* Error Message */}
          {!validationResult.isValid && validationResult.errorMessage && (
            <View style={styles.errorSection}>
              <Text style={styles.sectionTitle}>Issue Detected</Text>
              <Text style={styles.errorMessage}>{validationResult.errorMessage}</Text>
            </View>
          )}

          {/* Extracted Text */}
          {validationResult.extractedText && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Text Found in Image</Text>
              <View style={styles.textBox}>
                <Text style={styles.extractedText}>
                  {validationResult.extractedText.trim() || 'No text detected'}
                </Text>
              </View>
            </View>
          )}

          {/* Keywords Analysis */}
          {(validationResult.keywords.found.length > 0 || validationResult.keywords.missing.length > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Keyword Analysis</Text>
              
              {validationResult.keywords.found.length > 0 && (
                <View style={styles.keywordGroup}>
                  <Text style={styles.keywordLabel}>✅ Relevant keywords found:</Text>
                  <View style={styles.keywordContainer}>
                    {validationResult.keywords.found.map((keyword, index) => (
                      <View key={index} style={[styles.keyword, styles.foundKeyword]}>
                        <Text style={styles.foundKeywordText}>{keyword}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {validationResult.keywords.missing.length > 0 && !validationResult.isValid && (
                <View style={styles.keywordGroup}>
                  <Text style={styles.keywordLabel}>❌ Expected but not found:</Text>
                  <View style={styles.keywordContainer}>
                    {validationResult.keywords.missing.slice(0, 5).map((keyword, index) => (
                      <View key={index} style={[styles.keyword, styles.missingKeyword]}>
                        <Text style={styles.missingKeywordText}>{keyword}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Suggestions */}
          {validationResult.suggestions && validationResult.suggestions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 Suggestions</Text>
              {validationResult.suggestions.map((suggestion, index) => (
                <View key={index} style={styles.suggestion}>
                  <Text style={styles.suggestionBullet}>•</Text>
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Confidence Score */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Confidence Score</Text>
            <View style={styles.confidenceContainer}>
              <View style={styles.confidenceBar}>
                <View 
                  style={[
                    styles.confidenceFill, 
                    { 
                      width: `${validationResult.confidence * 100}%`,
                      backgroundColor: validationResult.confidence > 0.7 ? '#4CAF50' : 
                                       validationResult.confidence > 0.4 ? '#FF9800' : '#F44336'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.confidenceText}>
                {Math.round(validationResult.confidence * 100)}% match
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {!validationResult.isValid && (
            <>
              <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                <Ionicons name="refresh" size={20} color="#007bff" />
                <Text style={styles.retryButtonText}>Try Another Image</Text>
              </TouchableOpacity>
              
              {onSkip && (
                <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
                  <Text style={styles.skipButtonText}>Skip for Now</Text>
                </TouchableOpacity>
              )}
            </>
          )}
          
          <TouchableOpacity 
            style={[
              styles.continueButton,
              validationResult.isValid ? styles.successButton : styles.closeButton
            ]} 
            onPress={onClose}
          >
            <Text style={styles.continueButtonText}>
              {validationResult.isValid ? 'Continue' : 'Close'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Image Validation</Text>
          <View style={styles.placeholder} />
        </View>
        
        {isProcessing ? renderProcessingState() : renderValidationResult()}
      </View>
    </Modal>
  );
};

/**
 * Compact banner for showing validation results inline
 */
export const OCRValidationBanner: React.FC<OCRValidationBannerProps> = ({
  validationResult,
  onDismiss,
  onRetry,
  compact = false
}) => {
  if (validationResult.isValid) return null;

  return (
    <View style={[styles.banner, compact && styles.compactBanner]}>
      <View style={styles.bannerIcon}>
        <Ionicons name="alert-circle" size={20} color="#F44336" />
      </View>
      
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>Image validation failed</Text>
        {!compact && (
          <Text style={styles.bannerMessage} numberOfLines={2}>
            {validationResult.errorMessage || 'This image doesn\'t seem relevant to your task'}
          </Text>
        )}
      </View>
      
      <View style={styles.bannerActions}>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.bannerActionButton}>
            <Ionicons name="refresh" size={16} color="#007bff" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onDismiss} style={styles.bannerActionButton}>
          <Ionicons name="close" size={16} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Progress indicator for batch image validation
 */
export const ValidationProgress: React.FC<ValidationProgressProps> = ({
  currentImage,
  totalImages,
  currentImageName
}) => {
  const progress = currentImage / totalImages;

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Validating Images</Text>
        <Text style={styles.progressCounter}>{currentImage}/{totalImages}</Text>
      </View>
      
      {currentImageName && (
        <Text style={styles.progressImageName} numberOfLines={1}>
          Processing: {currentImageName}
        </Text>
      )}
      
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
      
      <Text style={styles.progressPercentage}>
        {Math.round(progress * 100)}% complete
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingTop: 50, // Account for status bar
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 24,
  },
  modalContent: {
    flex: 1,
  },
  
  // Processing State
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  processingSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Result Header
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  successHeader: {
    backgroundColor: '#4CAF50',
  },
  errorHeader: {
    backgroundColor: '#F44336',
  },
  resultHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Content Sections
  resultContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  errorSection: {
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#D32F2F',
    lineHeight: 20,
  },
  
  // Extracted Text
  textBox: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  extractedText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  
  // Keywords
  keywordGroup: {
    marginBottom: 12,
  },
  keywordLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  keywordContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  keyword: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  foundKeyword: {
    backgroundColor: '#E8F5E8',
  },
  foundKeywordText: {
    color: '#2E7D2E',
    fontSize: 12,
    fontWeight: '500',
  },
  missingKeyword: {
    backgroundColor: '#FFF0F0',
  },
  missingKeywordText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Suggestions
  suggestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  suggestionBullet: {
    fontSize: 14,
    color: '#007bff',
    marginRight: 8,
    marginTop: 2,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  
  // Confidence Score
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 12,
  },
  confidenceFill: {
    height: 8,
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  
  // Action Buttons
  actionButtons: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007bff',
    backgroundColor: 'white',
  },
  retryButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14,
  },
  continueButton: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  closeButton: {
    backgroundColor: '#666',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Banner Styles
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  compactBanner: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  bannerIcon: {
    marginRight: 12,
    paddingTop: 2,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 2,
  },
  bannerMessage: {
    fontSize: 13,
    color: '#B71C1C',
    lineHeight: 18,
  },
  bannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerActionButton: {
    padding: 4,
    marginLeft: 8,
  },
  
  // Progress Styles
  progressContainer: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    margin: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressCounter: {
    fontSize: 14,
    color: '#666',
  },
  progressImageName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#007bff',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});