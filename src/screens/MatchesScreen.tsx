import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Match } from '../../interfaces/match';

// Экран «Матчи тура» — задание в README.md, часть 1.
export function MatchesScreen() {

  const [matches, setMatches] = useState<Match[]>([]);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Матчи тура</Text>
      {

      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
});
