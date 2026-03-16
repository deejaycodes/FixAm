import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/services/auth';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import NewRequestScreen from './src/screens/NewRequestScreen';
import RequestStatusScreen from './src/screens/RequestStatusScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { colors } from './src/theme';

function TabBar({ active, setScreen }: { active: string; setScreen: (s: string) => void }) {
  const tabs = [
    { id: 'Home', icon: '🏠', label: 'Home' },
    { id: 'Activity', icon: '📋', label: 'Activity' },
    { id: 'Profile', icon: '👤', label: 'Profile' },
  ];
  return (
    <View style={st.tabBar}>
      {tabs.map(t => (
        <TouchableOpacity key={t.id} style={st.tab} onPress={() => setScreen(t.id)}>
          <Text style={{ fontSize: 20 }}>{t.icon}</Text>
          <Text style={[st.tabLabel, active === t.id && { color: colors.primary }]}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function AppContent() {
  const { token } = useAuth();
  const [screen, setScreen] = useState('Home');
  const [params, setParams] = useState<any>({});

  if (!token) {
    return <LoginScreen />;
  }

  const navigate = (s: string, p?: any) => { setScreen(s); setParams(p || {}); };
  const goBack = () => setScreen('Home');
  const nav = { navigate, goBack, replace: navigate, popToTop: () => setScreen('Home') };

  const renderScreen = () => {
    switch (screen) {
      case 'NewRequest':
        return <NewRequestScreen route={{ params }} navigation={nav} />;
      case 'RequestStatus':
        return <RequestStatusScreen route={{ params }} navigation={nav} />;
      case 'Activity':
        return <ActivityScreen navigation={nav} />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen navigation={nav} />;
    }
  };

  return (
    <View style={st.container}>
      <View style={st.content}>{renderScreen()}</View>
      {!['NewRequest', 'RequestStatus'].includes(screen) && (
        <TabBar active={screen} setScreen={setScreen} />
      )}
      {['NewRequest', 'RequestStatus'].includes(screen) && (
        <TouchableOpacity style={st.backBtn} onPress={goBack}>
          <Text style={st.backText}>← Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <AppContent />
    </AuthProvider>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, maxWidth: Platform.OS === 'web' ? 480 : undefined, alignSelf: 'center', width: '100%' },
  content: { flex: 1 },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: Platform.OS === 'web' ? 8 : 20, paddingTop: 8, backgroundColor: colors.bg },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  tabLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  backBtn: { position: 'absolute', top: 20, left: 16, zIndex: 10, padding: 8 },
  backText: { color: colors.primary, fontWeight: '600', fontSize: 16 },
});
