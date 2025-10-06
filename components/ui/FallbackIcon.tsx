import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';

interface FallbackIconProps {
  library: 'AntDesign' | 'MaterialCommunityIcons' | 'Ionicons';
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  fallbackText?: string;
}

const iconFallbacks: Record<string, string> = {
  'arrowleft': '←',
  'arrowright': '→',
  'arrow-right': '→',
  'arrow-left': '←',
  'chevron-right': '›',
  'chevron-left': '‹',
  'bell-outline': '🔔',
  'plus': '+',
  'home': '🏠',
  'search': '🔍',
  'user': '👤',
  'settings': '⚙️',
  'heart': '♥',
  'star': '★',
  'check': '✓',
  'close': '✕',
  'menu': '☰',
};

const IconComponent = ({ library, name, size = 24, color = '#000', style, fallbackText }: FallbackIconProps) => {
  const iconProps = { name: name as any, size, color, style };

  try {
    switch (library) {
      case 'AntDesign':
        return <AntDesign {...iconProps} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons {...iconProps} />;
      case 'Ionicons':
        return <Ionicons {...iconProps} />;
      default:
        throw new Error('Unknown library');
    }
  } catch (error) {
    // Fallback to text if icon library fails
    const fallback = fallbackText || iconFallbacks[name] || '?';
    return (
      <Text
        style={[
          {
            fontSize: size,
            color,
            textAlign: 'center',
            lineHeight: size + 2,
          },
          style,
        ]}
      >
        {fallback}
      </Text>
    );
  }
};

export default IconComponent;