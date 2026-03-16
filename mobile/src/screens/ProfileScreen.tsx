import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { useAuth } from '../services/auth';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={s.container}>
      <Text style={s.title}>Profile</Text>
      <View style={s.card}>
        <Text style={s.name}>{user?.name || 'Customer'}</Text>
        <Text style={s.phone}>{user?.phone}</Text>
        {user?.referralCode && <Text style={s.ref}>Referral code: {user.referralCode}</Text>}
      </View>
      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Text style={s.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 20 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  phone: { fontSize: 14, color: colors.textLight, marginTop: 4 },
  ref: { fontSize: 13, color: colors.primary, marginTop: 8, fontWeight: '500' },
  logoutBtn: { marginTop: 24, padding: 16, alignItems: 'center' },
  logoutText: { color: colors.danger, fontWeight: '600' },
});
