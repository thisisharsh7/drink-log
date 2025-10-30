import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProgressRing } from '../components/ProgressRing';
import { WaterGlass } from '../components/WaterGlass';
import { useWaterIntake } from '../hooks/useWaterIntake';
import { soundUtils } from '../utils/sound';
import { storageUtils } from '../utils/storage';
import { Colors } from '../constants/colors';

export default function Index() {
  const [dailyGoal, setDailyGoal] = useState(8);
  const { count, goal, progress, incrementCount, isLoading } = useWaterIntake(dailyGoal);

  useEffect(() => {
    soundUtils.initialize();
    loadDailyGoal();
  }, []);

  // Reload daily goal when screen comes into focus (after returning from settings)
  useFocusEffect(
    React.useCallback(() => {
      loadDailyGoal();
    }, [])
  );

  const loadDailyGoal = async () => {
    const goal = await storageUtils.getDailyGoal();
    setDailyGoal(goal);
  };

  const handleSettingsPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings');
  };

  const handleStatsPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/stats');
  };

  const handleTap = async () => {
    if (count < goal) {
      // Trigger haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Play sound
      await soundUtils.playPlinkSound();

      // Increment count
      await incrementCount();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.aquaSplash} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Navigation Buttons */}
      <TouchableOpacity
        style={styles.statsButton}
        onPress={handleStatsPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="bar-chart-outline" size={28} color={Colors.oceanBlue} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={handleSettingsPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="settings-outline" size={28} color={Colors.oceanBlue} />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Progress Ring with Water Glass */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleTap}
          style={styles.interactionArea}
        >
          <View style={styles.progressContainer}>
            <ProgressRing progress={progress} size={280} strokeWidth={12} />

            <View style={styles.centerContent}>
              <WaterGlass progress={progress} size={180} />

              {/* Progress Counter */}
              <View style={styles.counterContainer}>
                <Text style={styles.counterText}>
                  {count}
                  <Text style={styles.goalText}> / {goal}</Text>
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Instruction Text */}
        <Text style={styles.instructionText}>
          {count >= goal
            ? '🎉 Goal achieved! Great hydration!'
            : 'Tap the glass to log a drink'}
        </Text>
      </View>
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
  statsButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 22,
    shadowColor: Colors.oceanBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 22,
    shadowColor: Colors.oceanBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  interactionArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterContainer: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 20,
    shadowColor: Colors.oceanBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  counterText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: Colors.oceanBlue,
    textAlign: 'center',
  },
  goalText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 24,
    color: Colors.oceanBlue,
    opacity: 0.6,
  },
  instructionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.oceanBlue,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 20,
  },
});
