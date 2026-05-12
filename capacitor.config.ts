import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eldriverse.taromance.menu',
  appName: 'Taromance Menu',
  webDir: 'dist',
  server: {
    url: 'https://taromance-menu-app.vercel.app',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 800,
      backgroundColor: '#12100d',
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      overlaysWebView: true,
      style: 'DARK',
      backgroundColor: '#12100d',
    },
  },
};

export default config;
