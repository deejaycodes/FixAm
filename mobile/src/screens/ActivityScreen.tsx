import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { colors } from '../theme';
import { api } from '../services/api';
import { useAuth } from '../services/auth';

const statusIcon: Record<string, string> = {
  pending: '🔍', assigned: '⏳', accepted: '🚗', in_progress: '🔧', completed: '✅', cancelled: '❌',
};

export default function ActivityScreen({ navigation }: any) {
  const { token } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { const r = await api.getMyRequests(token!); setRequests(r); } catch {}
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <View style={s.container}>
      <Text style={s.title}>My Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => navigation.navigate('RequestStatus', { requestId: item.id })}>
            <View style={s.row}>
              <Text style={s.icon}>{statusIcon[item.status] || '📋'}</Text>
              <View style={s.info}>
                <Text style={s.service}>{item.serviceType}</Text>
                <Text style={s.desc} numberOfLines={1}>{item.description}</Text>
              </View>
              <Text style={s.statusText}>{item.status}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={s.empty}>No requests yet. Book your first artisan!</Text>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, padding: 24, paddingTop: 60 },
  card: { marginHorizontal: 16, marginBottom: 8, backgroundColor: colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 24, marginRight: 12 },
  info: { flex: 1 },
  service: { fontSize: 15, fontWeight: '600', color: colors.text, textTransform: 'capitalize' },
  desc: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  statusText: { fontSize: 12, color: colors.textMuted, textTransform: 'capitalize' },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 60, padding: 24 },
});
