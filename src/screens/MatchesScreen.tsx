import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { UpdatedAgo } from '../components/UpdatedAgo';
import { Match, MatchesResponse } from '../../interfaces/match';
import { MATCHES_URL } from '../config';

type FilterType = 'all' | 'upcoming' | 'finished';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'upcoming', label: 'Предстоящие' },
  { key: 'finished', label: 'Завершённые' },
];

export function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [round, setRound] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMatches = async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(MATCHES_URL);

      if (!response.ok) {
        throw new Error(`Ошибка сети: ${response.status}`);
      }

      const data: MatchesResponse = await response.json();
      setMatches(data.matches);
      setRound(data.round);
      setLastUpdated(new Date());
    } catch(err: any) {
      setError(err.message)
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const filteredMatches = useMemo(() => {
    if (activeFilter === 'upcoming') {
      return matches.filter((item) =>
        item.status === 'scheduled' || item.status === 'live' || item.status === 'postponed'
      );
    }
    if (activeFilter === 'finished') {
      return matches.filter((item) => item.status === 'finished');
    }
    return matches;
  }, [matches, activeFilter]);

  const renderMatchInfo = (item: Match) => {
    switch (item.status) {
      case 'live':
        return <Text style={styles.liveText}>Идет {item.minute}’</Text>;
      case 'finished':
        return <Text style={styles.statusText}>Завершен</Text>;
      case 'postponed':
        return <Text style={styles.postponedText}>Перенесен</Text>;
      case 'scheduled':
        if (!item.startsAt) return null;
        const date = new Date(item.startsAt);
        return (
          <Text style={styles.statusText}>
            {date.toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        );
    }
  };

  const renderItem = ({ item }: { item: Match }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>{renderMatchInfo(item)}</View>

      <View style={styles.matchContent}>
        <View style={styles.teamContainer}>
          <Text style={styles.teamName} numberOfLines={1}>
            {item.home.name}
          </Text>
          <Text style={styles.cityName}>{item.home.city}</Text>
        </View>

        <View style={styles.scoreContainer}>
          {item.score ? (
            <Text
              style={[
                styles.scoreText,
                item.status === 'live' && styles.liveScoreText,
              ]}
            >
              {item.score.home} : {item.score.away}
            </Text>
          ) : (
            <Text style={styles.vsText}>Против</Text>
          )}
        </View>

        <View style={[styles.teamContainer, styles.teamAway]}>
          <Text style={styles.teamName} numberOfLines={1}>
            {item.away.name}
          </Text>
          <Text style={styles.cityName}>{item.away.city}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>
            {round ? `Матчи ${round}-го тура` : 'Матчи тура'}
          </Text>
          {lastUpdated && (
            <UpdatedAgo key={lastUpdated.getTime()} since={lastUpdated} />
          )}
        </View>

        <Pressable
          style={styles.refreshButton}
          onPress={() => fetchMatches(false)}
          disabled={isLoading || isRefreshing}
        >
          <Text style={styles.refreshButtonText}>Обновить</Text>
        </Pressable>
      </View>

      <View style={styles.filterContainer}>
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <Pressable
              key={filter.key}
              style={[
                styles.filterButton,
                isActive && styles.filterButtonActive,
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  isActive && styles.filterButtonTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading && !isRefreshing && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Загрузка данных...</Text>
        </View>
      )}

      {error && !isLoading && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => fetchMatches(false)}>
            <Text style={styles.retryButtonText}>Повторить</Text>
          </Pressable>
        </View>
      )}

      {!isLoading && !error && (
        <FlatList
          data={filteredMatches}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchMatches(true)}
              tintColor="#007AFF"
              colors={['#007AFF']}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Нет доступных матчей</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 16,
    backgroundColor: '#F7F8FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  refreshButton: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    padding: 3,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  filterButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
  filterButtonTextActive: {
    color: '#1C1C1E',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF3B30',
  },
  postponedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF9500',
  },
  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamContainer: {
    flex: 1,
  },
  teamAway: {
    alignItems: 'flex-end',
  },
  teamName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  cityName: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  scoreContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  liveScoreText: {
    color: '#FF3B30',
  },
  vsText: {
    fontSize: 14,
    color: '#C7C7CC',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#8E8E93',
    fontSize: 14,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 40,
  },
});