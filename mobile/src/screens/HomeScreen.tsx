import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme';

const services = [
  { id: 'plumbing', icon: '🔧', name: 'Plumbing' },
  { id: 'electrical', icon: '⚡', name: 'Electrical' },
  { id: 'ac_repair', icon: '❄️', name: 'AC Repair' },
  { id: 'generator', icon: '⚙️', name: 'Generator' },
  { id: 'carpentry', icon: '🪚', name: 'Carpentry' },
  { id: 'emergency', icon: '🚨', name: 'Emergency' },
];

export default function HomeScreen({ navigation }: any) {
  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <Text style={s.greeting}>Hello 👋</Text>
        <Text style={s.title}>What needs fixing?</Text>
      </View>
      <View style={s.grid}>
        {services.map(svc => (
          <TouchableOpacity
            key={svc.id}
            style={s.card}
            onPress={() => navigation.navigate('NewRequest', { serviceType: svc.id, serviceName: svc.name })}
          >
            <Text style={s.icon}>{svc.icon}</Text>
            <Text style={s.cardText}>{svc.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { padding: 24, paddingTop: 60 },
  greeting: { fontSize: 16, color: colors.textLight },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  card: { width: '47%', backgroundColor: colors.card, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  icon: { fontSize: 32, marginBottom: 8 },
  cardText: { fontSize: 14, fontWeight: '600', color: colors.text },
});
