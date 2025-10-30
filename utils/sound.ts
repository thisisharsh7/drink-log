import { Audio } from 'expo-av';

export const soundUtils = {
  async playPlinkSound(): Promise<void> {
    try {
      // For now, we'll use system sounds via haptic feedback
      // In a production app, you would load a custom sound file:
      // const { sound } = await Audio.Sound.createAsync(
      //   require('../assets/sounds/plink.mp3')
      // );
      // await sound.playAsync();
      // await sound.unloadAsync();

      // Placeholder: Using a simple beep pattern with audio feedback
      // You can replace this with an actual sound file
      console.log('Plink sound would play here');
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  },

  async initialize(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  },
};
