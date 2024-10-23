import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useDerivedValue,
  Easing,
  withTiming,
  useAnimatedStyle,
  ReduceMotion,
} from 'react-native-reanimated';
import styles from './styles';

// FUnction to converttime in seconds into a percentage
function convertTimeLeftToPercentage(timeLeft, maximumTime) {
  return Math.round((timeLeft / maximumTime) * 100);
}

// Maximum time 20 seconds and 1 seconds means 5 percent
const secondAsPercentage = 5;

export default function TimeLeftBar({ timeLeft, maximumTime }) {
  // Shared value to hold width of the bar as percent
  // Shared value: https://docs.swmansion.com/react-native-reanimated/docs/2.x/api/hooks/useSharedValue/#:~:text=Use%20this%20hook%20to%20create%20a%20reference%20to,to%20react%20to%20changes%2C%20and%20also%20drive%20animations.
  const widthAsPercentage = useSharedValue(100);

  // Changes bar color based on the current percentage
  // Use derived value: https://docs.swmansion.com/react-native-reanimated/docs/2.x/api/hooks/useDerivedValue
  const barColor = useDerivedValue(() => {
    if (widthAsPercentage.value > 70) {
      return '#00FF00'; // Green
    } else if (widthAsPercentage.value > 30) {
      return '#FFFF00'; // Yellow
    } else {
      return '#FF0000'; // Red
    }
  });

  // Effect to modify the width of bar every time the time left is updated
  useEffect(() => {
    // Second as persentage (5)  is subtracted from the real percentage because bar is normally running late.
    // If this is not done:  when the time is up, bar is still running towards the end.
    const newWidthAsPercentage =
      convertTimeLeftToPercentage(timeLeft, maximumTime) - secondAsPercentage;
    // When the question has changed, newValue is bigger than current widthAsPercentage.
    // In this case bar has to be changed to full width instantly.
    const shouldChangeWidthInstantly =
      newWidthAsPercentage > widthAsPercentage.value;
    widthAsPercentage.value = withTiming(
      shouldChangeWidthInstantly ? 100 : newWidthAsPercentage,
      {
        // Options for the bar to reduce smoothly
        duration: shouldChangeWidthInstantly ? 0 : 1000,
        easing: Easing.linear,
        reduceMotion: ReduceMotion.Never,
      }
    );
  }, [maximumTime, timeLeft]);

  // Styles defined for animation (width and color of the bar)
  // useAnimatedStyle: https://docs.swmansion.com/react-native-reanimated/docs/2.x/api/hooks/useAnimatedStyle
  const animatedStyles = useAnimatedStyle(() => ({
    width: `${widthAsPercentage.value >= 0 ? widthAsPercentage.value : 0}%`,
    backgroundColor: barColor.value,
  }));

  return (
    <View style={styles.timeLeftBarContainer}>
      <Animated.View style={[styles.timeLeftBar, animatedStyles]} />
      {timeLeft === 0 ? (
        <Text style={{ fontWeight: 'bold', fontSize: 12 }}>Time's up!</Text>
      ) : (
        <Text style={{ fontSize: 12 }}>Time left: {timeLeft}</Text>
      )}
    </View>
  );
}
