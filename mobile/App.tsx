import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, FlatList, Linking, ActivityIndicator, Platform, RefreshControl } from 'react-native';

const colors = {
  primary: '#0D9488', dark: '#134E4A', accent: '#F59E0B', bg: '#FFFFFF',
  card: '#F9FAFB', border: '#E5E7EB', text: '#111827', textLight: '#6B7280',
  textMuted: '#9CA3AF', white: '#FFFFFF', danger: '#EF4444',
};

const BASE = 'https://fixam-production.up.railway.app';
async function api(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...opts, headers: { 'Content-Type': 'application/json', ...opts?.headers } });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `Error ${res.status}`); }
  return res.json();
}

const services = [
  { id: 'plumbing', icon: '🔧', name: 'Plumbing' },
  { id: 'electrical', icon: '⚡', name: 'Electrical' },
  { id: 'ac_repair', icon: '❄️', name: 'AC Repair' },
  { id: 'generator', icon: '⚙️', name: 'Generator' },
  { id: 'carpentry', icon: '🪚', name: 'Carpentry' },
  { id: 'emergency', icon: '🚨', name: 'Emergency' },
];

const statusIcon: Record<string, string> = {
  pending: '🔍', assigned: '⏳', accepted: '🚗', in_progress: '🔧', completed: '✅', cancelled: '❌',
};

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [screen, setScreen] = useState('Home');
  const [params, setParams] = useState<any>({});

  const nav = (s: string, p?: any) => { setScreen(s); if (p) setParams(p); };

  if (!token) return <Login onLogin={(t, u) => { setToken(t); setUser(u); }} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, maxWidth: Platform.OS === 'web' ? 480 : undefined, alignSelf: 'center', width: '100%' }}>
      <View style={{ flex: 1 }}>
        {screen === 'Home' && <Home nav={nav} user={user} />}
        {screen === 'NewRequest' && <NewRequest nav={nav} token={token} params={params} />}
        {screen === 'Status' && <Status nav={nav} token={token} params={params} />}
        {screen === 'Activity' && <Activity nav={nav} token={token} />}
        {screen === 'Profile' && <Profile user={user} onLogout={() => { setToken(null); setUser(null); }} />}
      </View>
      {['Home', 'Activity', 'Profile'].includes(screen) && (
        <View style={st.tabBar}>
          {[{ id: 'Home', icon: '🏠' }, { id: 'Activity', icon: '📋' }, { id: 'Profile', icon: '👤' }].map(t => (
            <TouchableOpacity key={t.id} style={st.tab} onPress={() => setScreen(t.id)}>
              <Text style={{ fontSize: 20 }}>{t.icon}</Text>
              <Text style={[st.tabLabel, screen === t.id && { color: colors.primary }]}>{t.id}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {['NewRequest', 'Status'].includes(screen) && (
        <TouchableOpacity style={{ position: 'absolute', top: 24, left: 16, zIndex: 10, padding: 8 }} onPress={() => setScreen('Home')}>
          <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function Login({ onLogin }: { onLogin: (t: string, u: any) => void }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isReg, setIsReg] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!phone.trim()) { Alert.alert('Enter phone number'); return; }
    setLoading(true);
    try {
      const res = isReg
        ? await api('/api/customer/register', { method: 'POST', body: JSON.stringify({ phone: phone.trim(), name: name.trim() }) })
        : await api('/api/customer/login', { method: 'POST', body: JSON.stringify({ phone: phone.trim() }) });
      onLogin(res.token, res.customer);
    } catch (e: any) { Alert.alert('Error', e.message); }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 24 }}>
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <Text style={{ fontSize: 40, fontWeight: '800', color: colors.text }}>Fix<Text style={{ color: colors.primary }}>Am</Text></Text>
        <Text style={{ fontSize: 16, color: colors.textLight, marginTop: 4 }}>Reliable artisans, one tap away.</Text>
      </View>
      {isReg && <TextInput style={st.input} placeholder="Your name" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />}
      <TextInput style={st.input} placeholder="Phone (e.g. 08012345678)" placeholderTextColor={colors.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TouchableOpacity style={st.btn} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={st.btnText}>{isReg ? 'Sign Up' : 'Log In'}</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsReg(!isReg)}>
        <Text style={{ color: colors.primary, textAlign: 'center', marginTop: 16, fontWeight: '500' }}>{isReg ? 'Already have an account? Log in' : 'New here? Create account'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function Home({ nav, user }: { nav: (s: string, p?: any) => void; user: any }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 24, paddingTop: 60 }}>
        <Text style={{ fontSize: 16, color: colors.textLight }}>Hello {user?.name || ''} 👋</Text>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, marginTop: 4 }}>What needs fixing?</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 }}>
        {services.map(s => (
          <TouchableOpacity key={s.id} style={{ width: '47%', backgroundColor: colors.card, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
            onPress={() => nav('NewRequest', { serviceType: s.id, serviceName: s.name })}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{s.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

function NewRequest({ nav, token, params }: { nav: (s: string, p?: any) => void; token: string; params: any }) {
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!desc.trim()) { Alert.alert('Describe the problem'); return; }
    setLoading(true);
    try {
      // Default Lagos location for web; native would use expo-location
      const loc = { lat: 6.5244, lng: 3.3792 };
      const res = await api('/api/requests', {
        method: 'POST',
        body: JSON.stringify({ serviceType: params.serviceType, description: desc.trim(), location: loc, emergency: params.serviceType === 'emergency' }),
        headers: { Authorization: `Bearer ${token}` },
      });
      nav('Status', { requestId: res.id });
    } catch (e: any) { Alert.alert('Error', e.message); }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 60 }}>
      <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600', marginBottom: 4 }}>{params.serviceName}</Text>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 20 }}>Describe the problem</Text>
      <TextInput style={[st.input, { minHeight: 120, textAlignVertical: 'top' }]} placeholder="e.g. My kitchen tap is leaking..." placeholderTextColor={colors.textMuted} multiline value={desc} onChangeText={setDesc} />
      <TouchableOpacity style={st.btn} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={st.btnText}>Find Artisan</Text>}
      </TouchableOpacity>
    </View>
  );
}

function Status({ nav, token, params }: { nav: (s: string, p?: any) => void; token: string; params: any }) {
  const [req, setReq] = useState<any>(null);

  React.useEffect(() => {
    const load = () => api(`/api/requests/${params.requestId}`, { headers: { Authorization: `Bearer ${token}` } }).then(setReq).catch(() => {});
    load();
    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, []);

  if (!req) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: colors.textLight }}>Loading...</Text></View>;

  const art = req.Artisan;
  const canCall = req.status === 'accepted' || req.status === 'in_progress';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 60 }}>
      <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600', textTransform: 'capitalize' }}>{req.serviceType}</Text>
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 4, marginBottom: 24 }}>
        {statusIcon[req.status] || '📋'} {req.status === 'pending' ? 'Finding artisan...' : req.status === 'assigned' ? 'Waiting for artisan' : req.status === 'accepted' ? 'Artisan on the way!' : req.status === 'in_progress' ? 'Job in progress' : req.status === 'completed' ? 'Job completed' : 'Cancelled'}
      </Text>
      {art && (
        <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{art.name}</Text>
          <Text style={{ fontSize: 14, color: colors.textLight, marginTop: 4 }}>⭐ {art.rating}/5</Text>
          {canCall && art.phone && (
            <TouchableOpacity style={[st.btn, { marginTop: 12 }]} onPress={() => Linking.openURL(`tel:${art.phone}`)}>
              <Text style={st.btnText}>📞 Call {art.phone}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {req.status === 'completed' && !req.rating && (
        <View>
          <Text style={{ fontSize: 16, color: colors.text, marginBottom: 8 }}>Rate this job:</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[1,2,3,4,5].map(n => (
              <TouchableOpacity key={n} onPress={async () => {
                await api(`/api/requests/${params.requestId}/rate`, { method: 'POST', body: JSON.stringify({ rating: n }), headers: { Authorization: `Bearer ${token}` } });
                Alert.alert('Thanks!'); nav('Home');
              }}>
                <Text style={{ fontSize: 28 }}>{'⭐'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      {(req.status === 'pending' || req.status === 'assigned') && (
        <TouchableOpacity style={{ marginTop: 24, padding: 16, alignItems: 'center' }} onPress={async () => {
          try { await api(`/api/requests/${params.requestId}/cancel`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); nav('Home'); }
          catch (e: any) { Alert.alert('Cannot cancel', e.message); }
        }}>
          <Text style={{ color: colors.danger, fontWeight: '600' }}>Cancel Request</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function Activity({ nav, token }: { nav: (s: string, p?: any) => void; token: string }) {
  const [reqs, setReqs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const load = async () => { try { setReqs(await api('/api/requests/mine', { headers: { Authorization: `Bearer ${token}` } })); } catch {} };
  React.useEffect(() => { load(); }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, padding: 24, paddingTop: 60 }}>My Requests</Text>
      <FlatList data={reqs} keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ marginHorizontal: 16, marginBottom: 8, backgroundColor: colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}
            onPress={() => nav('Status', { requestId: item.id })}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>{statusIcon[item.status] || '📋'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, textTransform: 'capitalize' }}>{item.serviceType}</Text>
                <Text style={{ fontSize: 13, color: colors.textLight, marginTop: 2 }} numberOfLines={1}>{item.description}</Text>
              </View>
              <Text style={{ fontSize: 12, color: colors.textMuted, textTransform: 'capitalize' }}>{item.status}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.textMuted, marginTop: 60 }}>No requests yet</Text>}
      />
    </View>
  );
}

function Profile({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 60 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 20 }}>Profile</Text>
      <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{user?.name || 'Customer'}</Text>
        <Text style={{ fontSize: 14, color: colors.textLight, marginTop: 4 }}>{user?.phone}</Text>
        {user?.referralCode && <Text style={{ fontSize: 13, color: colors.primary, marginTop: 8, fontWeight: '500' }}>Referral: {user.referralCode}</Text>}
      </View>
      <TouchableOpacity style={{ marginTop: 24, padding: 16, alignItems: 'center' }} onPress={onLogout}>
        <Text style={{ color: colors.danger, fontWeight: '600' }}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const st = StyleSheet.create({
  input: { backgroundColor: colors.card, borderRadius: 12, padding: 16, fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  btn: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: Platform.OS === 'web' ? 8 : 20, paddingTop: 8, backgroundColor: colors.bg },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  tabLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
});
