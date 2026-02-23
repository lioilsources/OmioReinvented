import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { QueryProvider } from '@/providers/QueryProvider';

export default function RootLayout() {
  const [mswReady, setMswReady] = useState(!__DEV__);

  useEffect(() => {
    if (__DEV__) {
      import('@/mocks').then(({ bootstrapMocks }) =>
        bootstrapMocks().then(() => setMswReady(true))
      );
    }
  }, []);

  if (!mswReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryProvider>
        <BottomSheetModalProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style="dark" />
        </BottomSheetModalProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
