import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    hoje: '📋',
    progresso: '📊',
    perfil: '👤',
  }
  return (
    <View style={styles.tabIcon}>
      <Text style={{ fontSize: 22 }}>{icons[name] || '📋'}</Text>
    </View>
  )
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5E5',
          paddingTop: 4,
          height: 60,
        },
        tabBarActiveTintColor: '#7EB89A',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="hoje"
        options={{
          title: 'Hoje',
          tabBarIcon: ({ focused }) => <TabIcon name="hoje" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progresso"
        options={{
          title: 'Progresso',
          tabBarIcon: ({ focused }) => <TabIcon name="progresso" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon name="perfil" focused={focused} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabIcon: { alignItems: 'center', justifyContent: 'center' },
})
