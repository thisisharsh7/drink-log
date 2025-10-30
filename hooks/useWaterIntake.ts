import { useState, useEffect, useCallback } from 'react';
import { storageUtils } from '../utils/storage';

export const useWaterIntake = (dailyGoal: number = 8) => {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWaterIntake();
  }, []);

  useEffect(() => {
    // Check for daily reset at midnight
    const checkMidnight = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        resetCount();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkMidnight);
  }, []);

  const loadWaterIntake = async () => {
    try {
      const data = await storageUtils.getWaterIntake();
      if (storageUtils.isToday(data.date)) {
        setCount(data.count);
      } else {
        // Reset if it's a new day
        await storageUtils.resetWaterIntake();
        setCount(0);
      }
    } catch (error) {
      console.error('Error loading water intake:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementCount = useCallback(async () => {
    const newCount = Math.min(count + 1, dailyGoal);
    setCount(newCount);
    await storageUtils.saveWaterIntake(newCount);
    await storageUtils.saveDayRecord(newCount, dailyGoal);
  }, [count, dailyGoal]);

  const resetCount = useCallback(async () => {
    setCount(0);
    await storageUtils.resetWaterIntake();
  }, []);

  const progress = dailyGoal > 0 ? count / dailyGoal : 0;

  return {
    count,
    goal: dailyGoal,
    progress,
    incrementCount,
    resetCount,
    isLoading,
  };
};
