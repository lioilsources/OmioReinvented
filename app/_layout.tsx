import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { QueryProvider } from '@/providers/QueryProvider';

export default function RootLayout() {
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
});
