import { useCallback} from 'react';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import { getSettings } from './database'; // Fetch settings from the database

let music; // Local variable to store the sound instance
let isLoading = false; // Track loading state
let isMusicLoaded = false; // Track if music is loaded

// Helper function to check if music is enabled
const isMusicEnabled = async () => {
  const settings = await getSettings();
  return settings.musicEnabled === 1;
};

// Helper function to check if sound effects are enabled
const isSoundEnabled = async () => {
  const settings = await getSettings();
  return settings.soundEnabled === 1;
};

// Function to play background music
export const playMusic = async (musicFile) => {
  try {
    const enabled = await isMusicEnabled();
    if (!enabled) return; // Don't play music if it's disabled in settings

    if (isLoading) return; // Prevent loading if already loading
    isLoading = true; // Set loading state

    // console.log('Loading Music'); // Log for debugging

    const { sound: newMusic } = await Audio.Sound.createAsync(musicFile);
    music = newMusic;
    await music.setIsLoopingAsync(true); // Loop the sound
    // console.log('Playing Music'); // Log for debugging
    await music.playAsync();
    isLoading = false; // Reset loading state after playback starts
    isMusicLoaded = true; // Music is now loaded

  } catch (error) {
    console.error('Error loading music:', error);
    isLoading = false; // Ensure loading state is reset on error
  }
};

// Function to stop and unload the background music
export const stopMusic = async () => {
  if (music) {
    try {
      // console.log('Stopping and unloading music'); // Log for debugging

      // Only stop and unload if the music is loaded
      if (isMusicLoaded) {
        await music.stopAsync();
        await music.unloadAsync();
        music = null; // Reset music after unloading
        isMusicLoaded = false; // Reset loaded state
      }
    } catch (error) {
      console.error('Error stopping/unloading music:', error);
    }
  }
};

// Function to manage play/stop of music based on screen focus
export const handleScreenMusic = (musicFile) => {
  useFocusEffect(
    useCallback(() => {
      playMusic(musicFile); // Play music when the screen gains focus

      return () => {
        stopMusic(); // Stop and unload music when the screen loses focus
      };
    }, [musicFile]) // Depend on the music file to play the correct track
  );
};

// Play a specific sound effect
export const playSound = async (soundFile) => {
  const enabled = await isSoundEnabled();
  if (!enabled) return; // Don't play sound effects if disabled in settings

  let sound;
  try {
    // console.log('Loading sound:', soundFile); // Log for debugging
    const { sound: newSound } = await Audio.Sound.createAsync(soundFile);
    sound = newSound;
    // console.log('Playing sound'); // Log for debugging
    await sound.playAsync();

    // Optionally unload the sound after it's done playing
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync(); // Unload the sound when playback finishes
      }
    });
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};
