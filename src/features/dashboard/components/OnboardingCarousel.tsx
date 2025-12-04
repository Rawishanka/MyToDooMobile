import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Keep splash screen visible while images load
SplashScreen.preventAutoHideAsync();

interface OnboardingSlide {
  id: string;
  image: any;
  title: string;
  subtitle: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    image: require('@/assets/images/illustration.png'),
    title: 'Add task to MyToDoo',
    subtitle: 'and lets get it done!',
  },
  {
    id: '2',
    image: require('@/assets/images/second_screen.png'),
    title: 'Select a local MyToDoo hero',
    subtitle: 'Skilled MyToDoo heros are waiting to help tick off those tasks',
  },
  {
    id: '3',
    image: require('@/assets/images/third_screen.png'),
    title: 'Release payment once the MyToDoo task is complete',
    subtitle: 'Your funds are held till the MyToDoo task is complete and you release payment.',
  },
];

export default function OnboardingCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Preload all images on component mount
  useEffect(() => {
    const preloadImages = async () => {
      try {
        const imagePromises = slides.map(slide => {
          return Image.prefetch(Image.resolveAssetSource(slide.image).uri);
        });
        
        await Promise.all(imagePromises);
        setImagesLoaded(true);
        await SplashScreen.hideAsync();
      } catch (error) {

        setImagesLoaded(true);
        await SplashScreen.hideAsync();
      }
    };

    preloadImages();
  }, []);

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const goToNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Last slide, go to next screen
      router.push('/(welcome-screen)/title-screen');
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    } else {
      // First slide, go back to welcome
      router.replace('/');
    }
  };

  const renderItem = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      {/* Illustration */}
      <Image 
        source={item.image} 
        style={styles.image} 
        resizeMode="contain"
        fadeDuration={0}
      />

      {/* Text */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dots}>
      {slides.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [6, 25, 6],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );

  // Show loading or placeholder while images are being preloaded
  if (!imagesLoaded) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back arrow */}
      <TouchableOpacity style={styles.backIcon} onPress={goToPrevious}>
        <ChevronLeft size={24} color="white" />
      </TouchableOpacity>

      {/* Progress dots */}
      {renderDots()}

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={32}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="center"
      />

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.signupButton} onPress={() => router.push('/(auth)/signup')}>
          <Text style={styles.signupText}>Sign up now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.arrowButton} onPress={goToNext}>
          <ChevronRight size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004aad',
    padding: 20,
    justifyContent: 'space-between',
  },
  backIcon: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 2,
  },
  dots: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 60,
    height: 10,
  },
  dot: {
    height: 6,
    backgroundColor: 'white',
    borderRadius: 5,
    marginHorizontal: 3,
  },
  slide: {
    width,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  image: {
    height: height * 0.4,
    width: width - 40,
    alignSelf: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  signupButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupText: {
    color: '#004aad',
    fontWeight: '600',
    textAlign: 'center',
  },
  arrowButton: {
    backgroundColor: '#FF7A00',
    padding: 14,
    borderRadius: 50,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
});
