import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { APP_CONFIG } from '../constants/config';
import { storageUtils } from '../utils/storage';
import { notificationUtils } from '../utils/notifications';

export default function Settings() {
  const [dailyGoal, setDailyGoal] = useState(APP_CONFIG.defaultDailyGoal);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await storageUtils.getAppSettings();
      setDailyGoal(settings.dailyGoal);
      setNotificationsEnabled(settings.notificationsEnabled);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoalChange = async (increment: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newGoal = increment
      ? Math.min(dailyGoal + 1, APP_CONFIG.maxDailyGoal)
      : Math.max(dailyGoal - 1, APP_CONFIG.minDailyGoal);

    if (newGoal !== dailyGoal) {
      setDailyGoal(newGoal);
      await storageUtils.saveDailyGoal(newGoal);
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (value) {
      // Request permissions and schedule notifications
      const hasPermission = await notificationUtils.requestPermissions();

      if (hasPermission) {
        setNotificationsEnabled(true);
        await storageUtils.saveNotificationsEnabled(true);
        await notificationUtils.scheduleReminders();
        Alert.alert(
          'Reminders Enabled',
          'You\'ll receive gentle hydration reminders throughout the day.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive hydration reminders.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // Cancel all notifications
      setNotificationsEnabled(false);
      await storageUtils.saveNotificationsEnabled(false);
      await notificationUtils.cancelAllReminders();
    }
  };

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Goal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Goal</Text>
          <View style={styles.card}>
            <View style={styles.goalContainer}>
              <View style={styles.goalInfo}>
                <Text style={styles.goalLabel}>Glasses per day</Text>
                <Text style={styles.goalValue}>{dailyGoal}</Text>
              </View>

              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={[
                    styles.stepperButton,
                    dailyGoal <= APP_CONFIG.minDailyGoal && styles.stepperButtonDisabled,
                  ]}
                  onPress={() => handleGoalChange(false)}
                  disabled={dailyGoal <= APP_CONFIG.minDailyGoal}
                >
                  <Ionicons
                    name="remove"
                    size={24}
                    color={
                      dailyGoal <= APP_CONFIG.minDailyGoal
                        ? Colors.lightGray
                        : Colors.oceanBlue
                    }
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.stepperButton,
                    dailyGoal >= APP_CONFIG.maxDailyGoal && styles.stepperButtonDisabled,
                  ]}
                  onPress={() => handleGoalChange(true)}
                  disabled={dailyGoal >= APP_CONFIG.maxDailyGoal}
                >
                  <Ionicons
                    name="add"
                    size={24}
                    color={
                      dailyGoal >= APP_CONFIG.maxDailyGoal
                        ? Colors.lightGray
                        : Colors.oceanBlue
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminders</Text>
          <View style={styles.card}>
            <View style={styles.notificationContainer}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationLabel}>Hydration Reminders</Text>
                <Text style={styles.notificationDescription}>
                  Gentle notifications throughout the day
                </Text>
              </View>

              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: Colors.lightGray, true: Colors.aquaSplash }}
                thumbColor={Colors.white}
                ios_backgroundColor={Colors.lightGray}
              />
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
    marginBottom: 32,
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
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.oceanBlue,
    marginBottom: 4,
  },
  goalValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: Colors.oceanBlue,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cloudGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.oceanBlue,
  },
  stepperButtonDisabled: {
    borderColor: Colors.lightGray,
    opacity: 0.5,
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationInfo: {
    flex: 1,
    marginRight: 16,
  },
  notificationLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: Colors.oceanBlue,
    marginBottom: 4,
  },
  notificationDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.oceanBlue,
    opacity: 0.6,
  },
});
