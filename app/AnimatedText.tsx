import { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

export default function AnimatedText({ children, style = {} }) {
  const textSize = useSharedValue(16); // Default font size is 16

  useEffect(() => {
    // Increases/decreases font size by 3 back and forth
    textSize.value = withRepeat(withTiming(textSize.value + 3, { duration: 300 }), 0, true)
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    fontSize: textSize.value,
  }));

  return (<Animated.Text style={[style, animatedStyle]}>{children}</Animated.Text>);
}