import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { storageUtils, StatsData } from '../utils/storage';
import { WeeklyChart } from '../components/WeeklyChart';
import { HydrationPlant } from '../components/HydrationPlant';

export default function Stats() {
  const [statsData, setStatsData] = useState<StatsData>({
    currentStreak: 0,
    totalGoalDays: 0,
    weeklyData: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await storageUtils.getStatsData();
      setStatsData(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={Colors.aquaSplash} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color={Colors.oceanBlue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Progress</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Streak */}
        <View style={styles.section}>
          <View style={styles.streakCard}>
            <View style={styles.streakIconContainer}>
              <Ionicons name="flame" size={40} color={Colors.mintGreen} />
            </View>
            <View style={styles.streakInfo}>
              <Text style={styles.streakValue}>
                {statsData.currentStreak}
              </Text>
              <Text style={styles.streakLabel}>
                {statsData.currentStreak === 1 ? 'Day Streak' : 'Day Streak'}
              </Text>
              {statsData.currentStreak > 0 && (
                <Text style={styles.streakEncouragement}>
                  Keep it going! 🎉
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.card}>
            <WeeklyChart data={statsData.weeklyData} />
          </View>
        </View>

        {/* Hydration Plant */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Hydration Plant</Text>
          <View style={styles.card}>
            <HydrationPlant totalGoalDays={statsData.totalGoalDays} />
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.section}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{statsData.totalGoalDays}</Text>
              <Text style={styles.summaryLabel}>Total Goal Days</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {statsData.weeklyData.filter((d) => d.goalMet).length}
              </Text>
              <Text style={styles.summaryLabel}>This Week</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cloudGray,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.cloudGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.cloudGray,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Colors.oceanBlue,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: Colors.oceanBlue,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.oceanBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  streakCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.oceanBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  streakIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.cloudGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  streakInfo: {
    flex: 1,
  },
  streakValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 36,
    color: Colors.mintGreen,
    marginBottom: 4,
  },
  streakLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: Colors.oceanBlue,
    marginBottom: 4,
  },
  streakEncouragement: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.oceanBlue,
    opacity: 0.6,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: Colors.oceanBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: Colors.oceanBlue,
    marginBottom: 4,
  },
  summaryLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.oceanBlue,
    opacity: 0.6,
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 50,
    backgroundColor: Colors.lightGray,
  },
});
