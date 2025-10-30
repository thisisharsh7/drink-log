import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';

interface HydrationPlantProps {
  totalGoalDays: number;
}

const PLANT_STAGES = [
  { minDays: 0, maxDays: 0, emoji: '🌱', name: 'Seed', size: 40 },
  { minDays: 1, maxDays: 2, emoji: '🌱', name: 'Sprout', size: 50 },
  { minDays: 3, maxDays: 5, emoji: '🌿', name: 'Seedling', size: 60 },
  { minDays: 6, maxDays: 9, emoji: '🪴', name: 'Young Plant', size: 70 },
  { minDays: 10, maxDays: 14, emoji: '🌳', name: 'Growing Tree', size: 80 },
  { minDays: 15, maxDays: 20, emoji: '🌲', name: 'Strong Tree', size: 90 },
  { minDays: 21, maxDays: Infinity, emoji: '🌴', name: 'Flourishing Tree', size: 100 },
];

const getPlantStage = (totalGoalDays: number) => {
  for (let i = PLANT_STAGES.length - 1; i >= 0; i--) {
    const stage = PLANT_STAGES[i];
    if (totalGoalDays >= stage.minDays && totalGoalDays <= stage.maxDays) {
      return { ...stage, stageIndex: i };
    }
  }
  return { ...PLANT_STAGES[0], stageIndex: 0 };
};

export const HydrationPlant: React.FC<HydrationPlantProps> = ({ totalGoalDays }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const currentStage = getPlantStage(totalGoalDays);

  // Trigger growth animation when stage changes
  useEffect(() => {
    // Sprouting animation
    scale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 100 }),
      withSpring(1, { damping: 10, stiffness: 80 })
    );

    rotation.value = withSequence(
      withTiming(-5, { duration: 150, easing: Easing.ease }),
      withTiming(5, { duration: 150, easing: Easing.ease }),
      withTiming(-3, { duration: 150, easing: Easing.ease }),
      withTiming(3, { duration: 150, easing: Easing.ease }),
      withTiming(0, { duration: 150, easing: Easing.ease })
    );
  }, [currentStage.stageIndex, scale, rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.plantContainer, animatedStyle]}>
        <Text style={[styles.plantEmoji, { fontSize: currentStage.size }]}>
          {currentStage.emoji}
        </Text>
      </Animated.View>

      <View style={styles.infoContainer}>
        <Text style={styles.stageName}>{currentStage.name}</Text>
        <Text style={styles.daysText}>
          {totalGoalDays} {totalGoalDays === 1 ? 'day' : 'days'} of hydration
        </Text>
      </View>

      {/* Progress to next stage */}
      {currentStage.stageIndex < PLANT_STAGES.length - 1 && (
        <View style={styles.nextStageContainer}>
          <Text style={styles.nextStageText}>
            {PLANT_STAGES[currentStage.stageIndex + 1].minDays - totalGoalDays} more{' '}
            {PLANT_STAGES[currentStage.stageIndex + 1].minDays - totalGoalDays === 1 ? 'day' : 'days'} to{' '}
            {PLANT_STAGES[currentStage.stageIndex + 1].name}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  plantContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  plantEmoji: {
    lineHeight: 120,
  },
  infoContainer: {
    alignItems: 'center',
  },
  stageName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: Colors.oceanBlue,
    marginBottom: 4,
  },
  daysText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.oceanBlue,
    opacity: 0.6,
  },
  nextStageContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.mintGreen,
    borderRadius: 12,
    opacity: 0.3,
  },
  nextStageText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.oceanBlue,
    textAlign: 'center',
  },
});
