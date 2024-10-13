import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useDerivedValue, Easing, withTiming, useAnimatedStyle, ReduceMotion } from 'react-native-reanimated';

// Converts a time in seconds into a percentage
function convertTimeLeftToPercentage(timeLeft, maximumTime) {
  return parseInt((timeLeft / maximumTime) * 100);
}

export default function TimeLeftBar({ timeLeft, maximumTime}) {
  // Shared value to hold width of the bar as percent
  const widthAsPercentage = useSharedValue(100);

  // Changes bar color based on the current percentage
  // TODO: adjust final colors
  const barColor = useDerivedValue(() => {
    if (widthAsPercentage.value > 70) {
      return '#00FF00';
    } else if (widthAsPercentage.value > 30) {
      return '#FFFF00';
    } else {
      return '#FF0000';
    }
  });

  // Modifies the width value every time is updated
  useEffect(() => {
    // Options are defined in a way that the bar is reducing constantly
    // 5 is subtracted from the percentage because bar is normally running late.
    // That means that when the time is up, bar is still running towards the end.
    widthAsPercentage.value = withTiming(convertTimeLeftToPercentage(timeLeft, maximumTime) - 5, {
      duration: 1000,
      easing: Easing.linear,
      reduceMotion: ReduceMotion.Never
    });
  }, [maximumTime, timeLeft])

  // Styles defined for animation (width and color of the bar)
  const animatedStyles = useAnimatedStyle(() => ({
    width: `${widthAsPercentage.value >= 0 ? widthAsPercentage.value : 0}%`,
    backgroundColor: barColor.value,
  }));

  return (
    <View style={styles.timeLeftBarContainer}>
      <Animated.View style={[styles.timeLeftBar, animatedStyles]} />
    </View>
  )
}

const styles = StyleSheet.create({
  timeLeftBarContainer: {
    width: '100%',
    height: 15,
  },
  timeLeftBar: {
    height: '100%',
  }
});