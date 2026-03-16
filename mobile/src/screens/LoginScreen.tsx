import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../theme';
import { api } from '../services/api';
import { useAuth } from '../services/auth';

export default function LoginScreen() {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!phone.trim()) { Alert.alert('Enter your phone number'); return; }
    setLoading(true);
    try {
      const res = isRegister
        ? await api.register(phone.trim(), name.trim())
        : await api.login(phone.trim());
      login(res.token, res.user || res.customer);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
    setLoading(false);
  };

  return (
    <View style={s.container}>
      <View style={s.top}>
        <Text style={s.logo}>Fix<Text style={{ color: colors.primary }}>Am</Text></Text>
        <Text style={s.subtitle}>Reliable artisans, one tap away.</Text>
      </View>
      <View style={s.form}>
        {isRegister && (
          <TextInput style={s.input} placeholder="Your name" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />
        )}
        <TextInput style={s.input} placeholder="Phone number (e.g. 08012345678)" placeholderTextColor={colors.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TouchableOpacity style={s.btn} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.white} /> : <Text style={s.btnText}>{isRegister ? 'Sign Up' : 'Log In'}</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
          <Text style={s.toggle}>{isRegister ? 'Already have an account? Log in' : 'New here? Create account'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 24 },
  top: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 40, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 16, color: colors.textLight, marginTop: 4 },
  form: {},
  input: { backgroundColor: colors.card, borderRadius: 12, padding: 16, fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  btn: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  toggle: { color: colors.primary, textAlign: 'center', marginTop: 16, fontWeight: '500' },
});
