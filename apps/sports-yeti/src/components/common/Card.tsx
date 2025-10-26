import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
}) => {
  return <View style={[styles.card, styles[variant], style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
  },
  default: {
    backgroundColor: '#ffffff',
  },
  elevated: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outlined: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
});

export default Card;
