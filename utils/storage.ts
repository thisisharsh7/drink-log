import AsyncStorage from '@react-native-async-storage/async-storage';

const WATER_INTAKE_KEY = '@hydra_water_intake';
const DAILY_GOAL_KEY = '@hydra_daily_goal';
const NOTIFICATIONS_ENABLED_KEY = '@hydra_notifications_enabled';
const HISTORY_KEY = '@hydra_history';

export interface WaterIntakeData {
  count: number;
  date: string;
}

export interface DayRecord {
  date: string;
  count: number;
  goal: number;
  goalMet: boolean;
}

export interface AppSettings {
  dailyGoal: number;
  notificationsEnabled: boolean;
}

export interface StatsData {
  currentStreak: number;
  totalGoalDays: number;
  weeklyData: DayRecord[];
}

export const storageUtils = {
  async getWaterIntake(): Promise<WaterIntakeData> {
    try {
      const data = await AsyncStorage.getItem(WATER_INTAKE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return { count: 0, date: this.getTodayString() };
    } catch (error) {
      console.error('Error getting water intake:', error);
      return { count: 0, date: this.getTodayString() };
    }
  },

  async saveWaterIntake(count: number): Promise<void> {
    try {
      const data: WaterIntakeData = {
        count,
        date: this.getTodayString(),
      };
      await AsyncStorage.setItem(WATER_INTAKE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving water intake:', error);
    }
  },

  async resetWaterIntake(): Promise<void> {
    try {
      const data: WaterIntakeData = {
        count: 0,
        date: this.getTodayString(),
      };
      await AsyncStorage.setItem(WATER_INTAKE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error resetting water intake:', error);
    }
  },

  getTodayString(): string {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  },

  async getDailyGoal(): Promise<number> {
    try {
      const goal = await AsyncStorage.getItem(DAILY_GOAL_KEY);
      return goal ? parseInt(goal, 10) : 8; // Default to 8
    } catch (error) {
      console.error('Error getting daily goal:', error);
      return 8;
    }
  },

  async saveDailyGoal(goal: number): Promise<void> {
    try {
      await AsyncStorage.setItem(DAILY_GOAL_KEY, goal.toString());
    } catch (error) {
      console.error('Error saving daily goal:', error);
    }
  },

  async getNotificationsEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error getting notifications setting:', error);
      return false;
    }
  },

  async saveNotificationsEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled.toString());
    } catch (error) {
      console.error('Error saving notifications setting:', error);
    }
  },

  async getAppSettings(): Promise<AppSettings> {
    try {
      const [dailyGoal, notificationsEnabled] = await Promise.all([
        this.getDailyGoal(),
        this.getNotificationsEnabled(),
      ]);
      return { dailyGoal, notificationsEnabled };
    } catch (error) {
      console.error('Error getting app settings:', error);
      return { dailyGoal: 8, notificationsEnabled: false };
    }
  },

  isToday(dateString: string): boolean {
    return dateString === this.getTodayString();
  },

  async getHistory(): Promise<Record<string, DayRecord>> {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting history:', error);
      return {};
    }
  },

  async saveHistory(history: Record<string, DayRecord>): Promise<void> {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  },

  async saveDayRecord(count: number, goal: number): Promise<void> {
    try {
      const today = this.getTodayString();
      const history = await this.getHistory();

      history[today] = {
        date: today,
        count,
        goal,
        goalMet: count >= goal,
      };

      await this.saveHistory(history);
    } catch (error) {
      console.error('Error saving day record:', error);
    }
  },

  getDateDaysAgo(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  },

  async getWeeklyData(): Promise<DayRecord[]> {
    try {
      const history = await this.getHistory();
      const weeklyData: DayRecord[] = [];

      for (let i = 6; i >= 0; i--) {
        const dateString = this.getDateDaysAgo(i);
        const record = history[dateString];

        if (record) {
          weeklyData.push(record);
        } else {
          // Create empty record for missing days
          weeklyData.push({
            date: dateString,
            count: 0,
            goal: await this.getDailyGoal(),
            goalMet: false,
          });
        }
      }

      return weeklyData;
    } catch (error) {
      console.error('Error getting weekly data:', error);
      return [];
    }
  },

  async getCurrentStreak(): Promise<number> {
    try {
      const history = await this.getHistory();
      let streak = 0;
      let date = new Date();

      while (true) {
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const record = history[dateString];

        if (record && record.goalMet) {
          streak++;
          date.setDate(date.getDate() - 1);
        } else if (dateString === this.getTodayString() && record && !record.goalMet) {
          // Today doesn't break streak if goal not yet met
          date.setDate(date.getDate() - 1);
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  },

  async getTotalGoalDays(): Promise<number> {
    try {
      const history = await this.getHistory();
      let total = 0;

      for (const dateString in history) {
        if (history[dateString].goalMet) {
          total++;
        }
      }

      return total;
    } catch (error) {
      console.error('Error getting total goal days:', error);
      return 0;
    }
  },

  async getStatsData(): Promise<StatsData> {
    try {
      const [currentStreak, totalGoalDays, weeklyData] = await Promise.all([
        this.getCurrentStreak(),
        this.getTotalGoalDays(),
        this.getWeeklyData(),
      ]);

      return { currentStreak, totalGoalDays, weeklyData };
    } catch (error) {
      console.error('Error getting stats data:', error);
      return { currentStreak: 0, totalGoalDays: 0, weeklyData: [] };
    }
  },
};
