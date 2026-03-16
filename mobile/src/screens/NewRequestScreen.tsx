import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { colors } from '../theme';
import { api } from '../services/api';
import { useAuth } from '../services/auth';

export default function NewRequestScreen({ route, navigation }: any) {
  const { serviceType, serviceName } = route.params;
  const { token } = useAuth();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!description.trim()) { Alert.alert('Please describe the problem'); return; }
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Location needed', 'Please enable location to find artisans near you.'); setLoading(false); return; }
      const loc = await Location.getCurrentPositionAsync({});
      const data = {
        serviceType,
        description: description.trim(),
        location: { lat: loc.coords.latitude, lng: loc.coords.longitude },
        emergency: serviceType === 'emergency',
      };
      const result = await api.createRequest(token!, data);
      navigation.replace('RequestStatus', { requestId: result.id });
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
    setLoading(false);
  };

  return (
    <View style={s.container}>
      <Text style={s.label}>{serviceName}</Text>
      <Text style={s.title}>Describe the problem</Text>
      <TextInput
        style={s.input}
        placeholder="e.g. My kitchen tap is leaking badly..."
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
        textAlignVertical="top"
      />
      <TouchableOpacity style={s.btn} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={s.btnText}>Find Artisan</Text>}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 60 },
  label: { fontSize: 14, color: colors.primary, fontWeight: '600', marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 20 },
  input: { backgroundColor: colors.card, borderRadius: 12, padding: 16, fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border, minHeight: 120, marginBottom: 24 },
  btn: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
