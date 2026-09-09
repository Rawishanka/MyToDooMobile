import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from '@/src/shared/utils/responsive';

interface VideoPlayerModalProps {
  visible: boolean;
  videoUrl: string;
  categoryName: string;
  onClose: () => void;
}

const VideoPlayerContent: React.FC<{ videoUrl: string; categoryName: string; onClose: () => void }> = ({
  videoUrl,
  categoryName,
  onClose,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const videoSize = Math.min(screenWidth * 0.85, 400);
  const [isLoading, setIsLoading] = useState(true);
  const isClosingRef = useRef(false);

  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
    p.muted = false;
  });

  const safeStopPlayer = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    try {
      player.pause();
      player.muted = true;
    } catch {
      // Player may already be released during unmount
    }
  }, [player]);

  useEffect(() => {
    isClosingRef.current = false;
    setIsLoading(true);

    const sub = player.addListener('statusChange', (payload) => {
      if (payload.status === 'readyToPlay' && !isClosingRef.current) {
        setIsLoading(false);
        try {
          player.play();
        } catch {
          // Ignore if player was released
        }
      }
    });

    try {
      player.play();
    } catch {
      // Ignore if player was released
    }

    return () => {
      sub.remove();
    };
  }, [player, videoUrl]);

  const handleClose = () => {
    safeStopPlayer();
    onClose();
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{categoryName}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={[styles.videoWrapper, { width: videoSize, height: videoSize }]}>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Loading video...</Text>
            </View>
          )}
          <VideoView
            player={player}
            style={styles.video}
            nativeControls={false}
            contentFit="cover"
          />
        </View>
      </View>
    </View>
  );
};

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  visible,
  videoUrl,
  categoryName,
  onClose,
}) => {
  const [renderPlayer, setRenderPlayer] = useState(false);

  useEffect(() => {
    if (visible && videoUrl) {
      setRenderPlayer(true);
      return;
    }

    const timeout = setTimeout(() => {
      setRenderPlayer(false);
    }, 350);

    return () => clearTimeout(timeout);
  }, [visible, videoUrl]);

  if (!videoUrl && !renderPlayer) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {renderPlayer && videoUrl ? (
        <VideoPlayerContent
          key={videoUrl}
          videoUrl={videoUrl}
          categoryName={categoryName}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    alignItems: 'center',
    width: '90%',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  loadingText: {
    color: '#ccc',
    fontSize: RFValue(12),
    marginTop: 10,
  },
});
