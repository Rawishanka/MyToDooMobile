// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import LottieView from 'lottie-react-native';
// import React, { useState } from 'react';
// import {
//   ActivityIndicator,
//   FlatList,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from 'react-native';

// // 🚀 **NEW: Import our comprehensive API hooks**
// import { Task } from '@/api/types/tasks';
// import { useGetAllTasks, useSearchTasks } from '@/hooks/useTaskApi';

// // Import the local assets
// const LottieAnimation = require('@/assets/animations/lottie-animation.json');

// const tags = ['End of lease cleaning', 'Help me move', 'Fix lights'];

// // 🔥 **REMOVED HARDCODED TASKS - NOW USING REAL API DATA!**

// export default function GetItDoneScreen() {  
//   const router = useRouter();
//   const [lottieLoaded, setLottieLoaded] = useState(false);
//   const [lottieError, setLottieError] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');

//   // 🚀 **NEW: Get real tasks from API**
//   const { 
//     data: tasksResponse, 
//     isLoading: isLoadingTasks, 
//     error: tasksError,
//     refetch: refetchTasks 
//   } = useGetAllTasks();

//   // 🔍 **NEW: Search functionality**
//   const { 
//     data: searchResults 
//   } = useSearchTasks({ 
//     search: searchQuery 
//   }, searchQuery.length > 2);

//   // Use search results if searching, otherwise use all tasks
//   const displayTasks = searchQuery.length > 2 ? searchResults?.data : tasksResponse?.data;
//   const tasks = displayTasks || [];

//   // 🎯 **NEW: Task card renderer with real data**
//   const renderTaskCard = ({ item }: { item: Task }) => (
//     <TouchableOpacity 
//       style={styles.taskBox}
//       activeOpacity={0.7}
//       onPress={() => router.push(`/(tabs)/task-detail?taskId=${item._id}`)}
//     >
//       <Text style={styles.name}>
//         {item.createdBy.firstName} {item.createdBy.lastName}
//       </Text>
//       <Text style={styles.desc} numberOfLines={2}>
//         {item.title}
//       </Text>
//       <Text style={styles.taskDetails} numberOfLines={1}>
//         📍 {item.location.address}
//       </Text>
//       <Text style={styles.budget}>
//         💰 {item.formattedBudget || `${item.currency} ${item.budget}`}
//       </Text>
//       <Text style={styles.messageLink}>💬 {item.offerCount || 0} offers</Text>
//     </TouchableOpacity>
//   );

//   // 🚨 **NEW: Error handling for API**
//   if (tasksError) {
//     return (
//       <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
//         <View style={styles.header}>
//           <View style={styles.logoContainer}>
//             <Text style={styles.fallbackLogo}>MyToDo</Text>
//           </View>
//         </View>
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>Failed to load tasks</Text>
//           <TouchableOpacity style={styles.retryButton} onPress={() => refetchTasks()}>
//             <Text style={styles.retryButtonText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     );
//   }
  
//   return (
//     <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
//       {/* Top Section with Animation Logo */}
//       <View style={styles.header}>
//         <View style={styles.logoContainer}>
//           {!lottieError ? (
//             <LottieView
//               source={LottieAnimation}
//               style={styles.logoAnimation}
//               autoPlay={true}
//               loop={true}
//               speed={1}
//               onAnimationFinish={() => {
//                 console.log('Logo animation finished');
//                 setLottieLoaded(true);
//               }}
//               onAnimationFailure={(error) => {
//                 console.log('Logo animation error:', error);
//                 setLottieError(true);
//               }}
//             />
//           ) : (
//             // Fallback text logo if Lottie fails to load
//             <Text style={styles.fallbackLogo}>MyToDoo</Text>
//           )}
//         </View>
//         <View style={styles.rightIcons}>
//           <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
//         </View>
//       </View>

//       {/* Greeting */}
//       <Text style={styles.greeting}>Good afternoon. Prasanna</Text>

//       {/* Post a Task Section - Now with Search */}
//       <View style={styles.taskCard}>
//         <Text style={styles.postTitle}>Post a Task. Get it Done.</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Search for tasks or describe what you need done..."
//           placeholderTextColor="#999"
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//         />
//         <TouchableOpacity 
//           style={styles.postButton}
//           onPress={() => router.push('/(welcome-screen)/first-screen')}
//         >
//           <MaterialCommunityIcons name="plus" size={18} color="#fff" />
//           <Text style={styles.postButtonText}>Post a Task</Text>
//           <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {/* Tags */}
//       <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagRow}>
//         {tags.map((tag, index) => (
//           <TouchableOpacity key={index} style={styles.tag}>
//             <Text style={{ color: '#007bff' }}>{tag}</Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       {/* Real Tasks from API */}
//       <Text style={styles.sectionTitle}>Available Tasks</Text>
//       <Text style={styles.subTitle}>
//         {searchQuery.length > 2 
//           ? `Search results for "${searchQuery}"` 
//           : "Browse and bid on tasks posted by others"
//         }
//       </Text>
      
//       {isLoadingTasks ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#007bff" />
//           <Text style={styles.loadingText}>Loading tasks...</Text>
//         </View>
//       ) : (
//         <FlatList
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           data={tasks}
//           keyExtractor={(item) => item._id}
//           renderItem={renderTaskCard}
//           style={{ marginBottom: 10, paddingHorizontal: 10 }}
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <Text style={styles.emptyText}>
//                 {searchQuery.length > 2 ? 'No tasks found for your search' : 'No tasks available'}
//               </Text>
//             </View>
//           }
//         />
//       )}

//       {/*  */}Category Grid - FRESH IMPLEMENTATION
//       <Text style={styles.sectionTitle}>Need something done</Text>
//       <Text style={styles.subTitle}>Cut through the competition and earn more with customers you know</Text>

//       {/* Simple test to verify changes are loading */}
//       {/* <View style={{backgroundColor: '#ff0000', padding: 20, margin: 10}}> */}
//         {/* <Text style={{color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center'}}> */}
//           {/* 🚨 FRESH START - If you see this, changes are working! */}
//         {/* </Text> */}
//       {/* </View> */}

//       <View style={styles.gridContainer}>
//         {/* We'll add the new video categories here step by step */}
//         {/* <TouchableOpacity style={styles.categoryItem}>
//           <View style={styles.categoryContent}>
//             <Text style={styles.categoryTitle}>📱 Coming Soon</Text>
//             <Text style={styles.categorySubtitle}>Video categories will appear here</Text>
//           </View>
//         </TouchableOpacity> */}
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: '#003399',
//     padding: 16,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   logoContainer: {
//     flex: 1,
//     alignItems: 'flex-start',
//   },
//   logoAnimation: {
//     width: 120,
//     height: 40,
//   },
//   fallbackLogo: { 
//     color: '#fff', 
//     fontSize: 20, 
//     fontWeight: 'bold' 
//   },
//   welcomeAnimation: {
//     width: '100%',
//     height: 200,
//   },
//   logo: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
//   greeting: { fontSize: 16, margin: 10, color: '#333' },
//   taskCard: { backgroundColor: '#003399', padding: 16 },
//   postTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
//   input: {
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     paddingVertical: 10,
//     fontSize: 14,
//     marginBottom: 10,
//   },
//   lottieAnimation: {
//     width: 40,
//     height: 40,
//   },
//   rightIcons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   lottieIcon: {
//     width: 24,
//     height: 24,
//   },
//   postButton: {
//     flexDirection: 'row',
//     backgroundColor: '#001f66',
//     padding: 12,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 6,
//   },
//   postButtonText: { color: '#fff', fontWeight: 'bold' },
//   tagRow: {
//     flexDirection: 'row',
//     paddingHorizontal: 10,
//     paddingTop: 10,
//   },
//   tag: {
//     borderWidth: 1,
//     borderColor: '#007bff',
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     marginRight: 10,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     paddingHorizontal: 10,
//     marginTop: 20,
//     marginBottom: 4,
//   },
//   subTitle: {
//     fontSize: 14,
//     color: '#444',
//     paddingHorizontal: 10,
//     marginBottom: 10,
//   },
//   taskBox: {
//     backgroundColor: '#e8f0fe',
//     borderRadius: 12,
//     padding: 14,
//     marginRight: 10,
//     width: 220,
//   },
//   name: { fontWeight: 'bold', marginBottom: 4 },
//   desc: { fontSize: 13, color: '#333' },
//   taskDetails: { fontSize: 12, color: '#666', marginTop: 2 },
//   budget: { fontSize: 12, color: '#007bff', fontWeight: 'bold', marginTop: 2 },
//   messageLink: { color: '#007bff', marginTop: 6, fontSize: 12 },
  
//   // 🚀 **NEW: API-related styles**
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 32,
//   },
//   errorText: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   retryButton: {
//     backgroundColor: '#007bff',
//     padding: 12,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   loadingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 20,
//   },
//   loadingText: {
//     marginLeft: 10,
//     color: '#666',
//   },
//   emptyContainer: {
//     padding: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: 200,
//   },
//   emptyText: {
//     color: '#666',
//     textAlign: 'center',
//   },
//   gridContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-around',
//     paddingBottom: 20,
//   },
  
//   // New category styles
//   categoryItem: {
//     backgroundColor: '#f5f5f5',
//     borderRadius: 12,
//     width: '42%',
//     paddingVertical: 20,
//     marginBottom: 12,
//     alignItems: 'center',
//   },
//   categoryContent: {
//     alignItems: 'center',
//   },
//   categoryTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     textAlign: 'center',
//     marginBottom: 4,
//   },
//   categorySubtitle: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'center',
//   },
// });