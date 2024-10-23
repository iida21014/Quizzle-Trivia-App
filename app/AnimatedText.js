import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export default function AnimatedText({ children, style = {} }) {
  // Container for font size which is modified by animation
  const textSize = useSharedValue(getFontSize());

  // Returns a font size from a given style prop. If it doesn't exist, returning 14
  function getFontSize() {
    return style.fontSize || 14; // Default font size is 14
  }

  useEffect(() => {
    // Increases/decreases font size by 2 back and forth
    // https://docs.swmansion.com/react-native-reanimated/docs/2.x/api/animations/withRepeat

    textSize.value = withRepeat(
      withTiming(getFontSize() + 2, { duration: 400 }),
      0,
      true
    );
  }, []);

  // Style which contains varying font size
  const animatedStyle = useAnimatedStyle(() => ({
    fontSize: textSize.value,
  }));

  // Animating children prop (content between starting and closing tags of AnimatedText)
  return (
    <Animated.Text style={[style, animatedStyle]}>{children}</Animated.Text>
  );
}
