// app/(tabs)/welcome-screen.tsx - Updated with category images
import NotificationModal from '@/src/features/messages/screens/notification-screen-api';
import { useUnreadCount } from '@/src/shared/hooks/useNotifications';
import { useGetCategories } from '@/src/shared/hooks/useTaskApi';
import { hp, isTablet, RFValue, wp } from '@/src/shared/utils/responsive';
import { useCreateTaskStore } from '@/src/store/create-task-store';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
// Using @expo/vector-icons for better iOS production build compatibility
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Image,
    Keyboard,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');

// � **ALL Category Images with proper sources**
const categoryImages: { id: string; title: string; image: string }[] = [
  { id: '1', title: 'Appliance Installation & Repair', image: 'https://i.ibb.co/W49F1KXP/Appliance-Instolation.png' },
  { id: '2', title: 'Auto Mechanic & Electrician', image: 'https://i.ibb.co/RGGCd2BP/Auto-mechanicle-and-Electrician.png' },
  { id: '3', title: 'Building Maintenance', image: 'https://i.ibb.co/k2yvpj3x/Building-Maintences-and-Renovations.png' },
  { id: '4', title: 'Business & Accounting', image: 'https://i.ibb.co/xtRGxgSy/Business-and-accounting.png' },
  { id: '5', title: 'Carpentry', image: 'https://i.ibb.co/W40cZb10/carpentry.png' },
  { id: '6', title: 'Delivery', image: 'https://i.ibb.co/6Rfyg45C/Delivery.png' },
  { id: '7', title: 'Education & Tutoring', image: 'https://i.ibb.co/7N2KYVg8/Education-and-Tutoring.png' },
  { id: '8', title: 'Electrical', image: 'https://i.ibb.co/tpB3FBRZ/Electrical.png' },
  { id: '9', title: 'Event Planning', image: 'https://i.ibb.co/3YPP7TRg/Event-Planning.png' },
  { id: '10', title: 'Furniture Repair', image: 'https://i.ibb.co/TMDZLQnw/furniture-repair-and-fl.png' },
  { id: '11', title: 'Graphic Design', image: 'https://i.ibb.co/s9zXGDBM/Graphic-Design.png' },
  { id: '12', title: 'Handyman & Handywomen', image: 'https://i.ibb.co/qMJDNCSy/Handyman-and-handywomen.png' },
  { id: '13', title: 'Health & Fitness', image: 'https://i.ibb.co/1J2Z4Vg5/health-and-fitness.png' },
  { id: '14', title: 'IT & Tech', image: 'https://i.ibb.co/WpHmsKRR/IT-and-Tech.png' },
  { id: '15', title: 'Legal Services', image: 'https://i.ibb.co/DfC74zpp/Legal-services.png' },
  { id: '16', title: 'Marketing', image: 'https://i.ibb.co/S4HF67H9/Marketing.png' },
  { id: '17', title: 'Music', image: 'https://i.ibb.co/YBwCYf8S/Music.png' },
  { id: '18', title: 'Painting', image: 'https://i.ibb.co/B58CyKLF/Painting-Services.png' },
  { id: '19', title: 'Personal Assistance', image: 'https://i.ibb.co/cScgX7jF/Personal-Assist.png' },
  { id: '20', title: 'Pet Care', image: 'https://i.ibb.co/TDSZJTq0/pet-care.png' },
  { id: '21', title: 'Photography', image: 'https://i.ibb.co/mrjdhnYG/Photography.png' },
  { id: '22', title: 'Plumbing', image: 'https://i.ibb.co/1G5rz4Yb/Plumbing.png' },
  { id: '23', title: 'Real Estate', image: 'https://i.ibb.co/dsrjsRJQ/Realestate.png' },
  { id: '24', title: 'Something Else', image: 'https://i.ibb.co/8LH3kKMD/somthing-else.png' },
  { id: '25', title: 'Tours & Transport', image: 'https://i.ibb.co/XrX1FRwV/Tours-and.png' },
  { id: '26', title: 'Web & App Development', image: 'https://i.ibb.co/9kPKTPzy/web-App-development.png' },
];

// � **Image Category Component for Carousel**
const ImageCategory = ({ item, onPress }: { item: typeof categoryImages[0]; onPress: (categoryName: string) => void }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  return (
    <TouchableOpacity 
      style={styles.carouselItem}
      activeOpacity={0.7}
      onPress={() => onPress(item.title)}
    >
      <View style={styles.imageContainer}>
        {/* Loading indicator while image loads */}
        {!imageLoaded && !imageError && (
          <ActivityIndicator 
            size="small" 
            color="#003399" 
            style={styles.imageLoader}
          />
        )}
        
        {/* Error placeholder if image fails to load */}
        {imageError && (
          <View style={styles.imageErrorContainer}>
            <MaterialCommunityIcons name="image-broken-variant" size={32} color="#ccc" />
          </View>
        )}
        
        {/* Actual image with proper caching and error handling */}
        <Image
          source={{ 
            uri: item.image,
            cache: 'force-cache', // Enable caching for better performance
          }}
          style={[
            styles.categoryImage,
            { opacity: imageLoaded ? 1 : 0 } // Fade in when loaded
          ]}
          resizeMode="contain"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            console.log('❌ Failed to load category image:', item.title);
            setImageError(true);
          }}
        />
      </View>
      <Text style={styles.carouselLabel} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );
};

export default function WelcomeScreen() {
  const router = useRouter();
  const [taskInput, setTaskInput] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [socialMenuOpen, setSocialMenuOpen] = useState(false);
  const { data: categories, isLoading: loadingCategories, error: categoriesError } = useGetCategories();
  const { data: unreadCountData } = useUnreadCount();
  const { updateMyTask, myTask } = useCreateTaskStore();

  const unreadCount = (unreadCountData as any)?.unreadCount || 0;

  // Auto-scroll carousel refs and state
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll every 3 seconds with safety checks
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % categoryImages.length;
        
        // Safety check: Only scroll if FlatList ref exists and is mounted
        try {
          flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
            viewPosition: 0.5, // Center the item
          });
        } catch (error) {
          // Silently handle scroll errors (can happen if list isn't fully rendered)
          console.log('Auto-scroll skipped (list not ready)');
        }
        
        return nextIndex;
      });
    }, 3000); // 3 second interval

    return () => clearInterval(interval);
  }, []); // Only run once on mount

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
    
    // Clear error and proceed
    setErrorMessage('');
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#003399' }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.headerWhite}>
        <View style={styles.logoPlaceholder} />
        
        <Image
          source={require('@/assets/MyToDoo_logo.gif')}
          style={styles.logoCenter} 
          resizeMode="contain"
        />
        
        <TouchableOpacity 
          style={styles.notificationButton} 
          onPress={() => setShowNotifications(true)}
        >
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        {/* Blue Section with Input */}
        <View style={styles.blueSection}>
          <Text style={styles.title}>Get it Done Now🔥</Text>
          <Text style={styles.subtitle}>
            Describe your job and get offers from mytoodoo
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="In a few words what do you need"
            placeholderTextColor="#999"
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

        {/* Auto-Scrolling Video Categories Carousel */}
        <Text style={styles.sectionTitle}>Need something done</Text>
        <Text style={styles.subTitle}>Cut through the competition and earn more with customers you know</Text>

        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={categoryImages}
            renderItem={({ item }) => <ImageCategory item={item} onPress={handleTagPress} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={screenWidth * 0.35 + 12}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={true} // Optimize for performance
            maxToRenderPerBatch={10} // Render 10 items at a time
            initialNumToRender={5} // Start with 5 visible items
            windowSize={5} // Keep 5 items in memory
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false } // Required for scroll tracking
            )}
            scrollEventThrottle={16} // Smooth 60fps scrolling
            getItemLayout={(data, index) => ({
              length: screenWidth * 0.35 + 12,
              offset: (screenWidth * 0.35 + 12) * index,
              index,
            })}
            onScrollToIndexFailed={(info) => {
              // Retry scrolling after a delay if failed
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
          
          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {Array.from({ length: Math.min(10, categoryImages.length) }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  Math.floor(currentIndex / 3) === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Social Media Section - Fixed at Bottom */}
      <View style={styles.socialMediaSection}>
        {/* Social Media Icons - Only show when menu is open */}
        {socialMenuOpen && (
          <View style={styles.socialIconsContainer}>
            <TouchableOpacity 
              style={[styles.socialIconWrapper, styles.whatsappBg]} 
              activeOpacity={0.8}
              onPress={() => Linking.openURL('https://wa.me/your-number')}
            >
              <Ionicons name="logo-whatsapp" size={22} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialIconWrapper, styles.facebookBg]} 
              activeOpacity={0.8}
              onPress={() => Linking.openURL('https://facebook.com/mytodoo')}
            >
              <Ionicons name="logo-facebook" size={22} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialIconWrapper, styles.instagramBg]} 
              activeOpacity={0.8}
              onPress={() => Linking.openURL('https://instagram.com/mytodoo')}
            >
              <Ionicons name="logo-instagram" size={22} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialIconWrapper, styles.linkedinBg]} 
              activeOpacity={0.8}
              onPress={() => Linking.openURL('https://linkedin.com/company/mytodoo')}
            >
              <Ionicons name="logo-linkedin" size={22} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialIconWrapper, styles.tiktokBg]} 
              activeOpacity={0.8}
              onPress={() => Linking.openURL('https://tiktok.com/@mytodoo')}
            >
              <Ionicons name="logo-tiktok" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Main FAB Button */}
        <TouchableOpacity 
          style={styles.fabButton}
          activeOpacity={0.8}
          onPress={() => setSocialMenuOpen(!socialMenuOpen)}
        >
          <Ionicons 
            name={socialMenuOpen ? "close" : "share-social"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>

        </View>
      </TouchableWithoutFeedback>

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
    minHeight: isTablet ? 100 : 80,
  },
  logoPlaceholder: {
    width: isTablet ? 28 : 24,
    flexShrink: 0,
  },
  logoCenter: {
    height: isTablet ? 300 : 150,
    width: isTablet ? 300 : 240,
    flexShrink: 0,
  },
  notificationButton: {
    position: 'relative',
    width: isTablet ? 28 : 24,
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
    fontSize: 12,
    fontWeight: 'bold',
  },
  blueSection: {
    backgroundColor: '#003399',
    paddingHorizontal: isTablet ? wp('12.5%') : wp('4%'),
    paddingTop: hp('1%'),
    paddingBottom: hp('2%'),
    maxWidth: isTablet ? 900 : undefined,
    alignSelf: isTablet ? 'center' : 'auto',
    width: '100%',
  },
  title: {
    fontSize: RFValue(isTablet ? 20 : 22),
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: hp('-5%'),
    marginBottom: hp('0.8%'),
    paddingHorizontal: wp('2%'),
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
    paddingBottom: hp('2.5%'),
    marginBottom: 0,
  },
  carouselContent: {
    paddingHorizontal: isTablet ? wp('8%') : wp('3%'),
    gap: wp('2%'),
  },
  carouselItem: {
    width: isTablet ? wp('18%') : screenWidth * 0.35,
    marginHorizontal: wp('1.5%'),
    alignItems: 'center',
  },
  imageContainer: {
    width: isTablet ? wp('18%') : screenWidth * 0.35,
    height: isTablet ? wp('18%') : screenWidth * 0.35,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E3F2FD',
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
    width: '90%',
    height: '90%',
    backgroundColor: '#E3F2FD',
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
  //  marginTop: 8,
    marginTop: isTablet ? wp('2.5%') : wp('2.3%'),
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
  // Social Media Section - Fixed at Bottom
  socialMediaSection: {
    position: 'absolute',
    right: isTablet ? wp('4%') : 14,
    bottom: isTablet ? 220 : 207,
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
});