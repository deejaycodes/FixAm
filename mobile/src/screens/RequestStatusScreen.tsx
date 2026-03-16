import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { colors } from '../theme';
import { api } from '../services/api';
import { useAuth } from '../services/auth';

export default function RequestStatusScreen({ route, navigation }: any) {
  const { requestId } = route.params;
  const { token } = useAuth();
  const [request, setRequest] = useState<any>(null);

  const load = async () => {
    try {
      const r = await api.getRequest(token!, requestId);
      setRequest(r);
    } catch {}
  };

  useEffect(() => { load(); const i = setInterval(load, 5000); return () => clearInterval(i); }, []);

  const cancel = async () => {
    try {
      await api.cancelRequest(token!, requestId);
      navigation.goBack();
    } catch (e: any) { Alert.alert('Cannot cancel', e.message); }
  };

  const rate = async (r: number) => {
    await api.rateRequest(token!, requestId, r);
    Alert.alert('Thanks!', 'Your rating has been submitted.');
    navigation.popToTop();
  };

  if (!request) return <View style={s.container}><Text style={s.loading}>Loading...</Text></View>;

  const artisan = request.Artisan;
  const status = request.status;

  return (
    <View style={s.container}>
      <Text style={s.service}>{request.serviceType}</Text>
      <Text style={s.status}>
        {status === 'pending' && '🔍 Finding artisan...'}
        {status === 'assigned' && '⏳ Waiting for artisan to accept'}
        {status === 'accepted' && '🚗 Artisan on the way!'}
        {status === 'in_progress' && '🔧 Job in progress'}
        {status === 'completed' && '✅ Job completed'}
        {status === 'cancelled' && '❌ Cancelled'}
      </Text>

      {artisan && (
        <View style={s.card}>
          <Text style={s.artisanName}>{artisan.name}</Text>
          <Text style={s.artisanInfo}>⭐ {artisan.rating}/5 • {artisan.totalJobs} jobs</Text>
          {status === 'accepted' || status === 'in_progress' ? (
            <TouchableOpacity style={s.callBtn} onPress={() => Linking.openURL(`tel:${artisan.phone}`)}>
              <Text style={s.callText}>📞 Call {artisan.phone}</Text>
            </TouchableOpacity>
          ) : null}
          {artisan.liveLocation && (
            <TouchableOpacity onPress={() => Linking.openURL(`https://maps.google.com/?q=${artisan.liveLocation.lat},${artisan.liveLocation.lng}`)}>
              <Text style={s.track}>📍 Track location</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {request.estimatedPrice && (
        <Text style={s.price}>Estimated: ₦{(request.estimatedPrice / 100).toLocaleString()}</Text>
      )}

      {status === 'completed' && !request.rating && (
        <View style={s.rateBox}>
          <Text style={s.rateLabel}>Rate this job:</Text>
          <View style={s.stars}>
            {[1,2,3,4,5].map(n => (
              <TouchableOpacity key={n} onPress={() => rate(n)}><Text style={s.star}>⭐</Text></TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {(status === 'pending' || status === 'assigned') && (
        <TouchableOpacity style={s.cancelBtn} onPress={cancel}>
          <Text style={s.cancelText}>Cancel Request</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 60 },
  loading: { color: colors.textLight, textAlign: 'center', marginTop: 100 },
  service: { fontSize: 14, color: colors.primary, fontWeight: '600', textTransform: 'capitalize' },
  status: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 4, marginBottom: 24 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  artisanName: { fontSize: 18, fontWeight: '700', color: colors.text },
  artisanInfo: { fontSize: 14, color: colors.textLight, marginTop: 4 },
  callBtn: { backgroundColor: colors.primary, borderRadius: 8, padding: 12, marginTop: 12, alignItems: 'center' },
  callText: { color: colors.white, fontWeight: '600' },
  track: { color: colors.primary, marginTop: 12, fontWeight: '600' },
  price: { fontSize: 16, color: colors.text, fontWeight: '600', marginBottom: 20 },
  rateBox: { marginTop: 20 },
  rateLabel: { fontSize: 16, color: colors.text, marginBottom: 8 },
  stars: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 28 },
  cancelBtn: { marginTop: 'auto', padding: 16, alignItems: 'center' },
  cancelText: { color: colors.danger, fontWeight: '600' },
});
