// app/(tabs)/welcome-screen.tsx - Welcome dashboard with API category carousel
import { getSocialMediaAccounts, SocialMediaAccount } from '@/src/api/user-profile-api';
import MyToDooBrandLogo from '@/src/shared/components/MyToDooBrandLogo';
import { AnimatedFireFlame } from '@/src/shared/components/AnimatedFireFlame';
import NotificationModal from '@/src/features/messages/screens/notification-screen-api';
import { useGetCategoriesWithCarouselImages } from '@/src/shared/hooks/useCategoriesApi';
import { useMergedUnreadCount } from '@/src/shared/hooks/useNotifications';
import { useGetCategories } from '@/src/shared/hooks/useTaskApi';
import { setPendingAccountNavigation } from '@/src/shared/utils/pending-account-navigation';
import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';
import { useCreateTaskStore } from '@/src/store/create-task-store';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
// Using @expo/vector-icons for better iOS production build compatibility
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Image,
    Keyboard,
    Linking,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    useWindowDimensions
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/shared/theme';
import { AppAlert } from '@/src/shared/components/AppAlert';
import { useAuthStore } from '@/src/store/auth-task-store';

interface CarouselCategoryItem {
  id: string;
  title: string;
  image: string;
}

const TABLET_PORTRAIT_GRID_COLUMNS = 4;
const TABLET_PORTRAIT_GRID_ROWS = 2;

const CarouselSkeletonCard = ({ itemSize }: { itemSize?: number }) => {
  const shimmer = useRef(new Animated.Value(0.35)).current;
  const squareSize = itemSize ?? (isTablet ? wp('18%') : wp('35%'));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 0.75, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0.35, duration: 900, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  return (
    <View style={[styles.carouselItem, itemSize ? { width: itemSize, marginHorizontal: 0 } : null]}>
      <Animated.View style={[styles.skeletonSquare, { width: squareSize, height: squareSize, opacity: shimmer }]} />
      <Animated.View style={[styles.skeletonLabelLine, { opacity: shimmer }]} />
    </View>
  );
};

const ImageCategory = ({
  item,
  onPress,
  itemSize,
}: {
  item: CarouselCategoryItem;
  onPress: (categoryName: string) => void;
  itemSize?: number;
}) => {
  const { isDarkMode } = useTheme();
  const squareSize = itemSize ?? (isTablet ? wp('18%') : wp('35%'));
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const shimmer = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    if (imageLoaded || imageError) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 0.75, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0.35, duration: 900, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [imageLoaded, imageError, shimmer]);

  return (
    <TouchableOpacity
      style={[styles.carouselItem, itemSize ? { width: itemSize, marginHorizontal: 0 } : null]}
      activeOpacity={0.7}
      onPress={() => onPress(item.title)}
    >
      <View style={[styles.imageContainer, { width: squareSize, height: squareSize }, isDarkMode && { backgroundColor: '#1E293B' }]}>
        {!imageLoaded && !imageError && (
          <Animated.View style={[styles.imageSkeleton, { opacity: shimmer }]} />
        )}

        {imageError ? (
          <View style={styles.imageErrorContainer}>
            <MaterialCommunityIcons name="image-broken-variant" size={32} color="#ccc" />
          </View>
        ) : (
          <Image
            source={{
              uri: item.image,
              cache: 'force-cache',
            }}
            style={[
              styles.categoryImage,
              { opacity: imageLoaded ? 1 : 0 },
            ]}
            resizeMode="cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              console.log('❌ Failed to load category image:', item.title);
              setImageError(true);
            }}
          />
        )}
      </View>
      <Text style={[styles.carouselLabel, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );
};

export default function WelcomeScreen() {
  const { isDarkMode } = useTheme();
  const { isAuthenticated, token } = useAuthStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isLandscape = screenWidth > screenHeight;
  const isTabletPortrait = isTablet && !isLandscape;

  const tabletPortraitGrid = useMemo(() => {
    if (!isTabletPortrait) return null;
    const horizontalPadding = wp('8%') * 2;
    const columnGap = 12;
    const itemSize =
      (screenWidth - horizontalPadding - columnGap * (TABLET_PORTRAIT_GRID_COLUMNS - 1)) /
      TABLET_PORTRAIT_GRID_COLUMNS;
    const visibleCount = TABLET_PORTRAIT_GRID_COLUMNS * TABLET_PORTRAIT_GRID_ROWS;
    return { itemSize, visibleCount, columnGap };
  }, [isTabletPortrait, screenWidth]);
  const [taskInput, setTaskInput] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [socialMenuOpen, setSocialMenuOpen] = useState(false);
  const [socialMediaAccounts, setSocialMediaAccounts] = useState<SocialMediaAccount[]>([]);
  const [isSocialMenuOpen, setIsSocialMenuOpen] = useState(false);
  const socialAnimation = useRef(new Animated.Value(0)).current;

  const toggleSocialMenu = () => {
    if (isSocialMenuOpen) {
      Animated.timing(socialAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setIsSocialMenuOpen(false));
    } else {
      setIsSocialMenuOpen(true);
      Animated.spring(socialAnimation, {
        toValue: 1,
        friction: 6,
        tension: 45,
        useNativeDriver: true,
      }).start();
    }
  };

  const closeSocialMenu = () => {
    if (isSocialMenuOpen) {
      Animated.timing(socialAnimation, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => setIsSocialMenuOpen(false));
    }
  };
  const { data: categories, isLoading: loadingCategories, error: categoriesError } = useGetCategories();
  const { data: carouselCategories, isLoading: loadingCarousel } = useGetCategoriesWithCarouselImages();
  const unreadCount = useMergedUnreadCount();
  const { updateMyTask, myTask } = useCreateTaskStore();

  const fabBottomOffset = isTablet
    ? Math.max(insets.bottom, 12) + 16
    : 78;

  const carouselItems: CarouselCategoryItem[] = (carouselCategories || []).map((cat) => ({
    id: cat._id,
    title: cat.name,
    image: cat.carouselImageUrl,
  }));

  // Load social media accounts from backend on mount
  useEffect(() => {
    getSocialMediaAccounts().then(setSocialMediaAccounts);
  }, []);

  // Auto-scroll carousel refs and state
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll every 3 seconds with safety checks
  useEffect(() => {
    if (carouselItems.length === 0 || isTabletPortrait) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % carouselItems.length;

        try {
          flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
            viewPosition: 0.5,
          });
        } catch (error) {
          console.log('Auto-scroll skipped (list not ready)');
        }

        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [carouselItems.length, isTabletPortrait]);

  // Reset task input and form when user returns to dashboard
  // This clears abandoned task creation forms
  useFocusEffect(
    useCallback(() => {
      console.log('📱 Dashboard focused - checking task state');
      console.log('   Current task title:', myTask.title);
      console.log('   Current task input:', taskInput);
      
      // Sync the input with store title if they differ
      // This handles cases where user navigated away and came back
      if (myTask.title && myTask.title !== taskInput) {
        setTaskInput(myTask.title);
        console.log('🔄 Synced task input with store title');
      } else if (!myTask.title && taskInput) {
        // If store is empty but input has value, clear the input
        setTaskInput('');
        console.log('🧹 Cleared task input (store is empty)');
      }
    }, [myTask.title])
  );

  // Add a function to reset the form completely
  const resetTaskForm = useCallback(() => {
    const { resetTask } = useCreateTaskStore.getState();
    resetTask();
    setTaskInput('');
    setErrorMessage('');
    console.log('✅ Task form completely reset');
  }, []);

  const handlePostTask = () => {
    const trimmedInput = taskInput.trim();
    
    // Validation checks
    if (!trimmedInput) {
      setErrorMessage('Please fill in what you need done');
      return;
    }
    
    if (trimmedInput.length < 10) {
      setErrorMessage('Please provide more details (at least 10 characters)');
      return;
    }
    
    if (trimmedInput.length > 100) {
      setErrorMessage('Task description is too long (max 100 characters)');
      return;
    }
    
    // Check for numbers
    const hasNumbers = /\d/.test(trimmedInput);
    if (hasNumbers) {
      setErrorMessage('Numbers are not allowed. Only letters, spaces, and basic punctuation.');
      return;
    }
    
    // Check for invalid special characters (allow only letters, spaces, apostrophes, hyphens, commas, periods)
    const hasInvalidChars = /[^a-zA-Z\s'\-,.]/.test(trimmedInput);
    if (hasInvalidChars) {
      setErrorMessage('Only letters, spaces, and basic punctuation (\' - , .) are allowed.');
      return;
    }
    
    // Clear error and proceed — reset stale task data first so category auto-suggest works fresh
    setErrorMessage('');
    const { resetTask } = useCreateTaskStore.getState();
    resetTask();
    updateMyTask({
      mainGoal: trimmedInput,
      title: trimmedInput
    });
    router.push('/(welcome-screen)/title-screen' as any);
  };

  const handleTagPress = (categoryName: string) => {
    console.log('📌 Category tag pressed:', categoryName);
    console.log('   Navigating to title-screen (create-task) with category:', categoryName);
    
    // Navigate to title-screen (which is the create-task page) with pre-selected category
    router.push({
      pathname: '/(welcome-screen)/title-screen',
      params: { 
        selectedCategory: categoryName,
        section: 'details'
      }
    } as any);
    
    console.log('   ✅ Navigation initiated');
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#003399' }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.headerWhite}>
        <View style={styles.logoPlaceholder} />
        
        <View style={styles.logoCenter}>
          <MyToDooBrandLogo size="lg" style={styles.logoBrandWrap} />
        </View>
        
        <TouchableOpacity 
          style={styles.notificationButton} 
          onPress={() => setShowNotifications(true)}
        >
          <Ionicons name="notifications-outline" size={isTablet ? 30 : 24} color="#fff" />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={[{ flex: 1, backgroundColor: '#f8f9fa' }, isDarkMode && { backgroundColor: '#0B1120' }]}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: isTabletPortrait ? 0 : 1,
            paddingBottom: isTabletPortrait ? 120 : 140,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
        {/* Blue Section with Input */}
        <View style={styles.blueSection}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Let&apos;s knock those tasks off your</Text>
            <View style={styles.titleSecondLine}>
              <Text style={styles.title}>list!</Text>
              <AnimatedFireFlame
                size={RFValue(isTablet ? 22 : 24)}
                style={styles.titleFlame}
              />
            </View>
          </View>
          <Text style={styles.subtitle}>
            Tell us what you need help with—taskers are waiting!
          </Text>
          
          <TextInput
            style={[styles.input, isDarkMode && { backgroundColor: '#1E293B', color: '#F8FAFC', borderWidth: 1, borderColor: '#334155' }]}
            placeholder="In a few words what do you need"
            placeholderTextColor={isDarkMode ? '#64748B' : '#999'}
            value={taskInput}
            onChangeText={(text) => {
              setTaskInput(text);
              // Clear error message while typing
              if (errorMessage) {
                setErrorMessage('');
              }
            }}
            maxLength={100}
            returnKeyType="done"
            onSubmitEditing={handlePostTask}
            multiline={false}
            numberOfLines={1}
          />
          
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
          
          <TouchableOpacity 
            style={styles.postButton} 
            onPress={handlePostTask}
          >
            <MaterialCommunityIcons name="plus" size={18} color="#fff" />
            <Text style={styles.postButtonText}>Post a Task</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.offerServiceButton, isDarkMode && { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' }]}
            onPress={() => {
              if (!isAuthenticated || !token) {
                AppAlert.alert(
                  'Login Required',
                  'Please log in or sign up to offer your services on MyToDoo.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Log In', onPress: () => router.push('/(auth)/login' as any) },
                  ]
                );
                return;
              }
              setPendingAccountNavigation({ screen: 'create-service' });
              router.push('/(tabs)/account' as any);
            }}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="briefcase-outline" size={18} color={isDarkMode ? '#38BDF8' : '#003399'} />
            <Text style={[styles.offerServiceText, isDarkMode && { color: '#38BDF8' }]}>Offer a service</Text>
          </TouchableOpacity>
          
          
          {/* Database Categories Tags */}
          {loadingCategories ? (
            <View style={styles.tagsLoadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.tagsLoadingText}>Loading categories...</Text>
            </View>
          ) : categoriesError ? (
            <View style={styles.tagsErrorContainer}>
              <Text style={styles.tagsErrorText}>Failed to load categories</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tagRow}
              keyboardShouldPersistTaps="handled"
            >
              {((categories?.data || []).map((cat: any) => typeof cat === 'string' ? cat : cat.name) || []).map((categoryName: string, index: number) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.tag}
                  onPress={() => handleTagPress(categoryName)}
                >
                  <Text style={{ color: '#fff' }}>{categoryName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {(loadingCarousel || carouselItems.length > 0) && (
          <>
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>Need something done?</Text>

        <View style={[styles.carouselContainer, isTabletPortrait && styles.carouselContainerTabletPortrait]}>
          {loadingCarousel ? (
            isTabletPortrait && tabletPortraitGrid ? (
              <View style={[styles.tabletPortraitGrid, { gap: tabletPortraitGrid.columnGap }]}>
                {Array.from({ length: tabletPortraitGrid.visibleCount }).map((_, i) => (
                  <CarouselSkeletonCard key={i} itemSize={tabletPortraitGrid.itemSize} />
                ))}
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContent}>
                {[1, 2, 3].map((i) => (
                  <CarouselSkeletonCard key={i} />
                ))}
              </ScrollView>
            )
          ) : isTabletPortrait && tabletPortraitGrid ? (
            <View style={[styles.tabletPortraitGrid, { gap: tabletPortraitGrid.columnGap }]}>
              {carouselItems.slice(0, tabletPortraitGrid.visibleCount).map((item) => (
                <ImageCategory
                  key={item.id}
                  item={item}
                  onPress={handleTagPress}
                  itemSize={tabletPortraitGrid.itemSize}
                />
              ))}
            </View>
          ) : (
          <>
          <FlatList
            ref={flatListRef}
            data={carouselItems}
            renderItem={({ item }) => <ImageCategory item={item} onPress={handleTagPress} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={isTablet ? screenWidth * 0.2 + 12 : screenWidth * 0.37 + 12}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={true}
            maxToRenderPerBatch={8}
            initialNumToRender={4}
            windowSize={5}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            getItemLayout={(data, index) => ({
              length: isTablet ? screenWidth * 0.2 + 12 : screenWidth * 0.37 + 12,
              offset: (isTablet ? screenWidth * 0.2 + 12 : screenWidth * 0.37 + 12) * index,
              index,
            })}
            onScrollToIndexFailed={(info) => {
              const wait = new Promise(resolve => setTimeout(resolve, 500));
              wait.then(() => {
                try {
                  flatListRef.current?.scrollToIndex({
                    index: info.index,
                    animated: true,
                    viewPosition: 0.5,
                  });
                } catch (error) {
                  console.log('Retry scroll failed, skipping');
                }
              });
            }}
          />

          <View style={styles.paginationContainer}>
            {Array.from({ length: Math.min(10, carouselItems.length) }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  Math.floor(currentIndex / 3) === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
          </>
          )}
        </View>
          </>
        )}
        
        </ScrollView>
      </View>

      </View>
      </TouchableWithoutFeedback>

      {/* Backdrop overlay for outside dismissal */}
      {isSocialMenuOpen && (
        <TouchableWithoutFeedback onPress={closeSocialMenu}>
          <Animated.View
            style={[
              styles.fabBackdrop,
              {
                opacity: socialAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.4],
                }),
              },
            ]}
          />
        </TouchableWithoutFeedback>
      )}

      {/* 2026 Modern Floating Social Media Action Menu */}
      {socialMediaAccounts.length > 0 && (
        <View style={styles.floatingSocialContainer} pointerEvents="box-none">
          {/* Expanded Action Menu Items */}
          {isSocialMenuOpen && (
            <Animated.View
              style={[
                styles.floatingMenuContent,
                {
                  opacity: socialAnimation,
                  transform: [
                    {
                      translateY: socialAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                    {
                      scale: socialAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.85, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {/* Share App Item */}
              <TouchableOpacity
                style={[
                  styles.socialMenuItem,
                  isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }
                ]}
                activeOpacity={0.8}
                onPress={async () => {
                  closeSocialMenu();
                  try {
                    await Share.share({
                      title: 'MyToDoo Australia',
                      message: 'Check out MyToDoo - Post tasks or find local service experts across Australia! https://mytodoo.com',
                    });
                  } catch (e) {}
                }}
              >
                <Text style={[styles.socialMenuLabel, isDarkMode && { color: '#38BDF8' }]}>Share App</Text>
                <View style={[styles.socialMenuIconCircle, { backgroundColor: isDarkMode ? '#0369A1' : '#0052A2' }]}>
                  <Ionicons name="share-social" size={17} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              {/* Social Channels List */}
              {socialMediaAccounts.map((account) => {
                const platform = account.platform.toLowerCase();
                const iconMap: Record<string, { icon: string; bg: string; name: string }> = {
                  whatsapp:  { icon: 'logo-whatsapp',  bg: '#25D366', name: 'WhatsApp' },
                  facebook:  { icon: 'logo-facebook',  bg: '#1877F2', name: 'Facebook' },
                  instagram: { icon: 'logo-instagram', bg: '#E1306C', name: 'Instagram' },
                  linkedin:  { icon: 'logo-linkedin',  bg: '#0077B5', name: 'LinkedIn' },
                  tiktok:    { icon: 'logo-tiktok',    bg: '#000000', name: 'TikTok' },
                  twitter:   { icon: 'logo-twitter',   bg: '#1DA1F2', name: 'X' },
                  youtube:   { icon: 'logo-youtube',   bg: '#FF0000', name: 'YouTube' },
                  pinterest: { icon: 'logo-pinterest', bg: '#E60023', name: 'Pinterest' },
                };
                const config = iconMap[platform] || { icon: 'globe-outline', bg: '#0052A2', name: account.platform };

                return (
                  <TouchableOpacity
                    key={account._id}
                    style={[
                      styles.socialMenuItem,
                      isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }
                    ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      closeSocialMenu();
                      Linking.openURL(account.profileUrl);
                    }}
                  >
                    <Text style={[styles.socialMenuLabel, isDarkMode && { color: '#F8FAFC' }]}>
                      {config.name}
                    </Text>
                    <View style={[styles.socialMenuIconCircle, { backgroundColor: config.bg }]}>
                      <Ionicons name={config.icon as any} size={17} color="#FFFFFF" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          )}

          {/* Main Floating Trigger Button */}
          <TouchableOpacity
            style={[
              styles.mainFabButton,
              isDarkMode && {
                backgroundColor: '#FF6A00',
                borderColor: '#FFA24C',
                borderWidth: 2,
                shadowColor: '#FF6A00',
                shadowOpacity: 0.6,
                shadowRadius: 10,
                elevation: 10,
              },
              isSocialMenuOpen && styles.mainFabButtonActive
            ]}
            activeOpacity={0.85}
            onPress={toggleSocialMenu}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: socialAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '90deg'],
                    }),
                  },
                ],
              }}
            >
              <Ionicons
                name={isSocialMenuOpen ? 'close' : 'share-social'}
                size={isTablet ? 24 : 20}
                color="#FFFFFF"
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      )}
      {/* Notification Modal */}
      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerWhite: {
    backgroundColor: '#003399',
    paddingHorizontal: isTablet ? wp('12.5%') : wp('4%'),
    paddingTop: hp('1%'),
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: isTablet ? 96 : 76,
  },
  logoPlaceholder: {
    width: isTablet ? 28 : 24,
    flexShrink: 0,
  },
  logoCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 1,
    minWidth: 0,
  },
  logoBrandWrap: {
    maxWidth: isTablet ? 300 : 240,
  },
  notificationButton: {
    position: 'relative',
    width: isTablet ? 44 : 36,
    height: isTablet ? 44 : 36,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#fff',
    fontSize: RFValue(12),
    fontWeight: 'bold',
  },
  blueSection: {
    backgroundColor: '#003399',
    paddingHorizontal: isTablet ? wp('8%') : wp('4%'),
    paddingTop: 0,
    paddingBottom: hp('2%'),
    width: '100%',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: hp('0.8%'),
    paddingHorizontal: wp('2%'),
  },
  titleSecondLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
  },
  title: {
    fontSize: RFValue(isTablet ? 20 : 22),
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  titleFlame: {
    marginTop: 2,
  },
  subtitle: {
    fontSize: RFValue(isTablet ? 13 : 14),
    color: '#fff',
    textAlign: 'center',
    marginBottom: hp('2%'),
    paddingHorizontal: wp('2%'),
    lineHeight: RFValue(isTablet ? 18 : 20),
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.8%'),
    fontSize: RFValue(isTablet ? 14 : 13),
    marginBottom: hp('2%'),
    minHeight: isTablet ? hp('6%') : hp('6.5%'),
    width: '100%',
    textAlignVertical: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    flexShrink: 1,
    includeFontPadding: false,
  },
  errorText: {
    color: '#ff4444',
    fontSize: RFValue(10),
    marginTop: hp('-1%'),
    marginBottom: hp('1%'),
    paddingLeft: wp('1%'),
    flexWrap: 'wrap',
  },
  postButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 8,
    paddingVertical: hp('1.5%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1.5%'),
  },
  postButtonText: {
    color: '#fff',
    fontSize: RFValue(14),
    fontWeight: '600',
    marginHorizontal: wp('2%'),
  },
  offerServiceButton: {
    backgroundColor: '#ffffff',
    borderWidth: 0,
    borderRadius: 8,
    paddingVertical: hp('1.3%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: hp('1%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  offerServiceText: {
    color: '#003399',
    fontSize: RFValue(13),
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  tagsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsLoadingText: {
    color: '#fff',
    marginLeft: 8,
  },
  tagsErrorContainer: {
    alignItems: 'center',
  },
  tagsErrorText: {
    color: '#ff6b35',
  },
  sectionTitle: {
    fontSize: RFValue(isTablet ? 17 : 18),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: hp('2%'),
    marginBottom: hp('0.8%'),
  },
  subTitle: {
    fontSize: RFValue(isTablet ? 12 : 13),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp('1.5%'),
    paddingHorizontal: isTablet ? wp('15%') : wp('5%'),
  },
  // NEW: Auto-scrolling Carousel Styles (show 5 at a time)
  carouselContainer: {
    paddingVertical: hp('1%'),
    paddingBottom: hp('2%'),
    marginBottom: 0,
  },
  carouselContainerTabletPortrait: {
    paddingTop: hp('0.5%'),
    paddingBottom: hp('1%'),
  },
  tabletPortraitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: wp('8%'),
    rowGap: 16,
  },
  carouselContent: {
    paddingHorizontal: isTablet ? wp('8%') : wp('3%'),
    gap: wp('2%'),
  },
  carouselItem: {
    width: isTablet ? wp('18%') : wp('35%'),
    marginHorizontal: wp('1.5%'),
    alignItems: 'center',
  },
  imageContainer: {
    width: isTablet ? wp('18%') : wp('35%'),
    height: isTablet ? wp('18%') : wp('35%'),
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
  },
  imageSkeleton: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#e8e8e8',
    zIndex: 1,
  },
  skeletonSquare: {
    width: isTablet ? wp('18%') : wp('35%'),
    height: isTablet ? wp('18%') : wp('35%'),
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  skeletonLabelLine: {
    width: '60%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginTop: hp('0.8%'),
  },
  imageLoader: {
    position: 'absolute',
    zIndex: 1,
  },
  imageErrorContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
  },
  carouselLabel: {
    fontSize: RFValue(isTablet ? 9 : 10),
    fontWeight: '700',
    color: '#1A237E',
    textAlign: 'center',
    marginTop: hp('0.8%'),
    lineHeight: RFValue(isTablet ? 11 : 13),
    paddingHorizontal: wp('0.5%'),
  },
  // Pagination Dots
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: isTablet ? wp('2.5%') : wp('2.3%'),
    marginBottom: hp('0.5%'),
    gap: 5,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 51, 153, 0.3)',
  },
  paginationDotActive: {
    backgroundColor: '#003399',
    width: 18,
  },
  // 2026 Community Card Styles
  communityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
    marginHorizontal: isTablet ? wp('2%') : 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  communityIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityTitle: {
    fontSize: RFValue(15),
    fontWeight: '700',
    color: '#0F172A',
  },
  communitySubtitle: {
    fontSize: RFValue(12),
    color: '#64748B',
    marginTop: 2,
  },
  socialChipsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
    marginBottom: 14,
  },
  socialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  socialChipIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialChipText: {
    fontSize: RFValue(12),
    fontWeight: '600',
    color: '#1E293B',
  },
  shareAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  shareAppText: {
    fontSize: RFValue(13),
    fontWeight: '700',
    color: '#0052A2',
  },
  // Social Media Section - Legacy removed
  socialMediaSection: {
    position: 'absolute',
    right: isTablet ? wp('4%') : 14,
    backgroundColor: 'transparent',
    zIndex: 12,
    alignItems: 'center',
  },
  fabButton: {
    width: isTablet ? 48 : 40,
    height: isTablet ? 48 : 40,
    borderRadius: isTablet ? 24 : 20,
    backgroundColor: '#00993bf2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  socialIconsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: isTablet ? 14 : 12,
    marginBottom: isTablet ? 14 : 12,
  },
  socialIconWrapper: {
    width: isTablet ? 50 : 44,
    height: isTablet ? 50 : 44,
    borderRadius: isTablet ? 25 : 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  whatsappBg: {
    backgroundColor: '#25D366',
  },
  facebookBg: {
    backgroundColor: '#1877F2',
  },
  instagramBg: {
    backgroundColor: '#E1306C',
  },
  linkedinBg: {
    backgroundColor: '#0A66C2',
  },
  tiktokBg: {
    backgroundColor: '#000000',
  },
  fabBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 9998,
  },
  floatingSocialContainer: {
    position: 'absolute',
    right: isTablet ? wp('4%') : 18,
    bottom: isTablet ? 18 : 10,
    zIndex: 9999,
    alignItems: 'flex-end',
  },
  floatingMenuContent: {
    alignItems: 'flex-end',
    marginBottom: 10,
    gap: 8,
  },
  socialMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingLeft: 14,
    paddingRight: 6,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    gap: 8,
  },
  socialMenuLabel: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#1E293B',
  },
  socialMenuIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainFabButton: {
    width: isTablet ? 48 : 42,
    height: isTablet ? 48 : 42,
    borderRadius: isTablet ? 24 : 21,
    backgroundColor: '#0052A2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0052A2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  mainFabButtonActive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
});