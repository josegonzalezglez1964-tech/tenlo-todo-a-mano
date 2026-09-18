import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import DocumentsScreen from './src/screens/DocumentsScreen';
import AddDocumentScreen from './src/screens/AddDocumentScreen';
import { isLoggedIn } from './src/api/client';

type Screen = 'documents' | 'add';

export default function App() {
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [screen, setScreen] = useState<Screen>('documents');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    (async () => {
      const logged = await isLoggedIn();
      setLoggedIn(logged);
      setChecking(false);
    })();
  }, []);

  if (checking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2c3e50" />
      </View>
    );
  }

  if (!loggedIn) {
    return (
      <>
        <StatusBar style="auto" />
        <LoginScreen onLoginSuccess={() => setLoggedIn(true)} />
      </>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      {screen === 'documents' ? (
        <DocumentsScreen
          onLogout={() => setLoggedIn(false)}
          onAddPress={() => setScreen('add')}
          refreshKey={refreshKey}
        />
      ) : (
        <AddDocumentScreen
          onSaved={() => {
            setRefreshKey((k) => k + 1);
            setScreen('documents');
          }}
          onCancel={() => setScreen('documents')}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});