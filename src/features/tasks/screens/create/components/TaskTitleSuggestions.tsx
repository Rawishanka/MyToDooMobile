// import { geminiService } from '@/src/services/geminiService';
// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// interface TaskTitleSuggestionsProps {
//   selectedCategory: string | null;
//   onSuggestionSelect: (suggestion: string) => void;
//   currentTitle: string;
// }

// export const TaskTitleSuggestions: React.FC<TaskTitleSuggestionsProps> = ({
//   selectedCategory,
//   onSuggestionSelect,
//   currentTitle
// }) => {
//   const [suggestions, setSuggestions] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (selectedCategory && selectedCategory !== 'Select a category') {
//       loadSuggestions(selectedCategory);
//     } else {
//       setSuggestions([]);
//       setError(null);
//     }
//   }, [selectedCategory]);

//   const loadSuggestions = async (category: string) => {
//     try {
//       setLoading(true);
//       setError(null);
//       console.log('🤖 Loading title suggestions for category:', category);
      
//       const titleSuggestions = await geminiService.suggestTaskTitles(category);
//       setSuggestions(titleSuggestions);
//       console.log('✅ Loaded suggestions:', titleSuggestions);
      
//     } catch (error) {
//       console.error('❌ Error loading title suggestions:', error);
//       setError('Failed to load suggestions');
//       setSuggestions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSuggestionPress = (suggestion: string) => {
//     console.log('💡 Title suggestion selected:', suggestion);
//     onSuggestionSelect(suggestion);
//   };

//   if (!selectedCategory || selectedCategory === 'Select a category') {
//     return null;
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header with AI icon */}
//       <View style={styles.header}>
//         <Text style={styles.aiIcon}>✨</Text>
//         <Text style={styles.headerText}>
//           AI-powered suggestions for {selectedCategory}
//         </Text>
//       </View>

//       {/* Loading state */}
//       {loading && (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="small" color="#8B5CF6" />
//           <Text style={styles.loadingText}>Generating suggestions...</Text>
//         </View>
//       )}

//       {/* Error state */}
//       {error && (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>{error}</Text>
//         </View>
//       )}

//       {/* Suggestions */}
//       {!loading && !error && suggestions.length > 0 && (
//         <View style={styles.suggestionsContainer}>
//           {suggestions.map((suggestion, index) => (
//             <TouchableOpacity
//               key={index}
//               style={[
//                 styles.suggestionButton,
//                 currentTitle === suggestion && styles.suggestionButtonSelected
//               ]}
//               onPress={() => handleSuggestionPress(suggestion)}
//               activeOpacity={0.8}
//             >
//               <Text style={[
//                 styles.suggestionText,
//                 currentTitle === suggestion && styles.suggestionTextSelected
//               ]}>
//                 {suggestion}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       )}

//       {/* Helper text */}
//       {!loading && !error && suggestions.length > 0 && (
//         <Text style={styles.helperText}>
//           💡 Click a suggestion to use it as your task title, or type your own
//         </Text>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     marginVertical: 8,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   aiIcon: {
//     fontSize: 14,
//     marginRight: 6,
//   },
//   headerText: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#6B7280',
//     flex: 1,
//   },
//   loadingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   loadingText: {
//     marginLeft: 8,
//     fontSize: 13,
//     color: '#6B7280',
//   },
//   errorContainer: {
//     paddingVertical: 8,
//   },
//   errorText: {
//     fontSize: 13,
//     color: '#EF4444',
//   },
//   suggestionsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'flex-start',
//     alignItems: 'center',
//     gap: 6,
//     marginBottom: 8,
//   },
//   suggestionButton: {
//     backgroundColor: '#8B5CF6',
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 20,
//     shadowColor: '#8B5CF6',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   suggestionButtonSelected: {
//     backgroundColor: '#7C3AED',
//     shadowOpacity: 0.3,
//   },
//   suggestionText: {
//     color: '#FFFFFF',
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   suggestionTextSelected: {
//     fontWeight: '700',
//   },
//   helperText: {
//     fontSize: 11,
//     color: '#6B7280',
//     marginTop: 6,
//     fontStyle: 'italic',
//     textAlign: 'center',
//   },
// });