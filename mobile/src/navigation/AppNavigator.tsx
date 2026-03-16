import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../services/auth';
import { colors } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import NewRequestScreen from '../screens/NewRequestScreen';
import RequestStatusScreen from '../screens/RequestStatusScreen';
import ActivityScreen from '../screens/ActivityScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: { borderTopColor: colors.border },
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, any> = { Home: 'home', Activity: 'list', Profile: 'person' };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { token } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={HomeTabs} />
            <Stack.Screen name="NewRequest" component={NewRequestScreen} />
            <Stack.Screen name="RequestStatus" component={RequestStatusScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
