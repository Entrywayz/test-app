import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  isFavorite: boolean;
  onPress: () => void;
};

export function FavoriteButton({ isFavorite, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      <Text style={[styles.star, isFavorite && styles.starActive]}>
        {isFavorite ? '★' : '☆'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    fontSize: 22,
    color: '#C7C7CC',
  },
  starActive: {
    color: '#FFCC00',
  },
});