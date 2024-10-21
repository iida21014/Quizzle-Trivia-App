import { useCallback } from 'react';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';

let music; // Local variable to store the sound instance

// Function to play background music
export const playMusic = async (musicFile) => {
  try {
    console.log('Loading Music');
    if (music) {
      await stopMusic(); // Stop any currently playing music before starting new
    }
    const { sound: newMusic } = await Audio.Sound.createAsync(musicFile);
    music = newMusic;
    await music.setIsLoopingAsync(true); // Loop the sound
    console.log('Playing Music');
    await music.playAsync();
  } catch (error) {
    console.error('Error loading music:', error);
  }
};

// Function to stop and unload the background music
export const stopMusic = async () => {
  if (music) {
    try {
      console.log('Stopping and unloading music');
      await music.stopAsync();
      await music.unloadAsync();
      music = null;
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
    let sound;
    try {
      console.log('Loading sound:', soundFile);
      const { sound: newSound } = await Audio.Sound.createAsync(soundFile);
      sound = newSound;
      console.log('Playing sound');
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