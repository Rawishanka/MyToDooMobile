// Construction Icon Component

import React from 'react';
import { StyleSheet, View } from 'react-native';

export const ConstructionIcon: React.FC = () => (
  <View style={styles.constructionContainer}>
    {/* Traffic Cones */}
    <View style={styles.cone1}>
      <View style={styles.coneBase} />
      <View style={styles.coneTop} />
      <View style={styles.coneStripe} />
    </View>
    
    {/* Construction Barrier */}
    <View style={styles.barrier}>
      <View style={styles.barrierPost1} />
      <View style={styles.barrierPost2} />
      <View style={styles.barrierBoard}>
        <View style={styles.barrierStripe1} />
        <View style={styles.barrierStripe2} />
        <View style={styles.barrierStripe3} />
      </View>
    </View>
    
    <View style={styles.cone2}>
      <View style={styles.coneBase} />
      <View style={styles.coneTop} />
      <View style={styles.coneStripe} />
    </View>
    
    <View style={styles.cone3}>
      <View style={styles.coneBase} />
      <View style={styles.coneTop} />
      <View style={styles.coneStripe} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  constructionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 80,
    width: 200,
  },
  cone1: {
    position: 'absolute',
    left: 20,
    bottom: 0,
  },
  cone2: {
    position: 'absolute',
    right: 20,
    bottom: 0,
  },
  cone3: {
    position: 'absolute',
    right: 60,
    bottom: 0,
  },
  coneBase: {
    width: 20,
    height: 25,
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  coneTop: {
    position: 'absolute',
    top: -3,
    left: 8,
    width: 4,
    height: 8,
    backgroundColor: '#D32F2F',
    borderRadius: 2, 
  },
  coneStripe: {
    position: 'absolute',
    top: 8,
    left: 2,
    right: 2,
    height: 3,
    backgroundColor: '#fff',
  },
  barrier: {
    position: 'relative',
    alignItems: 'center',
    bottom: 0,
  },
  barrierPost1: {
    position: 'absolute',
    left: -15,
    bottom: 0,
    width: 4,
    height: 35,
    backgroundColor: '#8B4513',
    borderRadius: 2,
  },
  barrierPost2: {
    position: 'absolute',
    right: -15,
    bottom: 0,
    width: 4,
    height: 35,
    borderRadius: 2,
    backgroundColor: '#8B4513',
  },
  barrierBoard: {
    width: 60,
    height: 20,
    backgroundColor: '#FF6B35',
    borderRadius: 4,
    position: 'relative',
    bottom: 15,
  },
  barrierStripe1: {
    position: 'absolute',
    left: 2,
    top: 2,
    width: 12,
    height: 3,
    backgroundColor: '#fff',
    transform: [{ rotate: '45deg' }],
  },
  barrierStripe2: {
    position: 'absolute',
    left: 20,
    top: 2,
    width: 12,
    height: 3,
    backgroundColor: '#fff',
    transform: [{ rotate: '45deg' }],
  },
  barrierStripe3: {
    position: 'absolute',
    left: 38,
    top: 2,
    width: 12,
    height: 3,
    backgroundColor: '#fff',
    transform: [{ rotate: '45deg' }],
  },
});
