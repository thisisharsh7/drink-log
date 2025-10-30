import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { DayRecord } from '../utils/storage';
import { Colors } from '../constants/colors';

interface WeeklyChartProps {
  data: DayRecord[];
}

const BAR_HEIGHT = 120;
const SHORT_DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const getDayLabel = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  const dayIndex = date.getDay();
  return SHORT_DAY_LABELS[dayIndex];
};

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const maxCount = Math.max(...data.map((d) => Math.max(d.count, d.goal)), 1);

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {data.map((day, index) => {
          const heightPercentage = (day.count / maxCount) * 100;
          const goalLinePercentage = (day.goal / maxCount) * 100;

          return (
            <ChartBar
              key={day.date}
              heightPercentage={heightPercentage}
              goalLinePercentage={goalLinePercentage}
              goalMet={day.goalMet}
              delay={index * 50}
              count={day.count}
            />
          );
        })}
      </View>

      <View style={styles.labelsContainer}>
        {data.map((day, index) => (
          <Text key={index} style={styles.dayLabel}>
            {getDayLabel(day.date)}
          </Text>
        ))}
      </View>
    </View>
  );
};

interface ChartBarProps {
  heightPercentage: number;
  goalLinePercentage: number;
  goalMet: boolean;
  delay: number;
  count: number;
}

const ChartBar: React.FC<ChartBarProps> = ({
  heightPercentage,
  goalLinePercentage,
  goalMet,
  delay,
  count,
}) => {
  const animatedHeight = useSharedValue(0);

  React.useEffect(() => {
    animatedHeight.value = withDelay(
      delay,
      withSpring(heightPercentage, {
        damping: 12,
        stiffness: 100,
      })
    );
  }, [heightPercentage, delay, animatedHeight]);

  const barAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: `${animatedHeight.value}%`,
    };
  });

  return (
    <View style={styles.barContainer}>
      <View style={styles.barWrapper}>
        {/* Goal line */}
        <View
          style={[
            styles.goalLine,
            { bottom: `${goalLinePercentage}%` },
          ]}
        />

        {/* Bar */}
        <Animated.View
          style={[
            styles.bar,
            barAnimatedStyle,
            {
              backgroundColor: goalMet ? Colors.mintGreen : Colors.aquaSplash,
            },
          ]}
        >
          {count > 0 && (
            <Text style={styles.countText}>{count}</Text>
          )}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_HEIGHT,
    paddingHorizontal: 4,
  },
  barContainer: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 4,
  },
  barWrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 8,
    minHeight: 4,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.oceanBlue,
    opacity: 0.3,
  },
  countText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
    color: Colors.white,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  dayLabel: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.oceanBlue,
    opacity: 0.6,
    textAlign: 'center',
  },
});
