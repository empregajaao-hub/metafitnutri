import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.6c2c0850231041968df59d0823bba40c',
  appName: 'METAFIT NUTRI',
  webDir: 'dist',
  server: {
    url: 'https://6c2c0850-2310-4196-8df5-9d0823bba40c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: '#FCF8F3',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#F97316',
    },
    Camera: {
      presentationStyle: 'fullscreen',
    },
    Permissions: {
      permissions: ['camera', 'photos'],
    },
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#FCF8F3',
  },
  ios: {
    backgroundColor: '#FCF8F3',
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },
};

export default config;
