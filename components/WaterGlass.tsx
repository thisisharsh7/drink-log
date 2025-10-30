import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../constants/colors';

interface WaterGlassProps {
  progress: number;
  size?: number;
}

interface Bubble {
  id: number;
  delay: number;
  x: number;
  opacity: SharedValue<number>;
  y: SharedValue<number>;
}

const BubbleComponent: React.FC<{ bubble: Bubble }> = ({ bubble }) => {
  const bubbleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bubble.opacity.value,
    transform: [{ translateY: bubble.y.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.bubble,
        bubbleAnimatedStyle,
        { left: bubble.x },
      ]}
    />
  );
};

export const WaterGlass: React.FC<WaterGlassProps> = ({ progress, size = 200 }) => {
  const waterLevel = useSharedValue(0);
  const wobbleRotation = useSharedValue(0);

  const bubble1Opacity = useSharedValue(0);
  const bubble1Y = useSharedValue(0);
  const bubble2Opacity = useSharedValue(0);
  const bubble2Y = useSharedValue(0);
  const bubble3Opacity = useSharedValue(0);
  const bubble3Y = useSharedValue(0);

  const bubbles: Bubble[] = useMemo(() => [
    { id: 1, delay: 0, x: 40, opacity: bubble1Opacity, y: bubble1Y },
    { id: 2, delay: 200, x: 60, opacity: bubble2Opacity, y: bubble2Y },
    { id: 3, delay: 400, x: 80, opacity: bubble3Opacity, y: bubble3Y },
  ], [bubble1Opacity, bubble1Y, bubble2Opacity, bubble2Y, bubble3Opacity, bubble3Y]);

  useEffect(() => {
    // Animate water level
    waterLevel.value = withSpring(progress, {
      damping: 15,
      stiffness: 100,
    });

    // Wobble effect
    wobbleRotation.value = withSequence(
      withTiming(3, { duration: 150, easing: Easing.ease }),
      withTiming(-3, { duration: 150, easing: Easing.ease }),
      withTiming(2, { duration: 150, easing: Easing.ease }),
      withTiming(-2, { duration: 150, easing: Easing.ease }),
      withTiming(0, { duration: 150, easing: Easing.ease })
    );

    // Animate bubbles
    bubbles.forEach((bubble) => {
      setTimeout(() => {
        bubble.opacity.value = withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 300 })
        );
        bubble.y.value = withSequence(
          withTiming(-40, { duration: 600, easing: Easing.ease }),
          withTiming(0, { duration: 0 })
        );
      }, bubble.delay);
    });
  }, [progress, waterLevel, wobbleRotation, bubbles]);

  const waterAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: `${waterLevel.value * 100}%`,
    };
  });

  const glassAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${wobbleRotation.value}deg` }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[{ width: size, height: size * 1.3 }, glassAnimatedStyle]}>
        {/* Water fill */}
        <Animated.View
          style={[
            styles.waterFill,
            waterAnimatedStyle,
            { backgroundColor: Colors.aquaSplash },
          ]}
        >
          {/* Bubbles */}
          {bubbles.map((bubble) => (
            <BubbleComponent key={bubble.id} bubble={bubble} />
          ))}
        </Animated.View>

        {/* Glass outline */}
        <Svg width={size} height={size * 1.3} viewBox="0 0 100 130" style={styles.glassSvg}>
          {/* Glass shape */}
          <Path
            d="M 25 10 L 20 120 Q 20 125 25 125 L 75 125 Q 80 125 80 120 L 75 10 Q 75 5 70 5 L 30 5 Q 25 5 25 10 Z"
            fill="none"
            stroke={Colors.oceanBlue}
            strokeWidth="3"
            opacity={0.3}
          />
          {/* Glass rim highlight */}
          <Path
            d="M 30 5 L 70 5"
            fill="none"
            stroke={Colors.aquaSplash}
            strokeWidth="2"
            opacity={0.5}
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterFill: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    width: '80%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  glassSvg: {
    position: 'absolute',
  },
  bubble: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
    bottom: 10,
  },
});
