import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={20} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'about',
          tabBarIcon: ({ color }) => <FontAwesome size={20} name="cog" color={color} />,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'camera',
          tabBarIcon: ({ color }) => <FontAwesome size={20} name="camera" color={color} />,
        }}
      />
      <Tabs.Screen
        name="enregistrement_audio"
        options={{
          title: 'Audio',
          tabBarIcon: ({ color }) => <FontAwesome size={20} name="play" color={color} />,
        }}
      />
      <Tabs.Screen
        name="connexion"
        options={{
          title: 'connexion',
          tabBarIcon: ({ color }) => <FontAwesome size={20} name="wifi" color={color} />,
        }}
      />

      <Tabs.Screen
        name="contact"
        options={{
          title: 'contact',
          tabBarIcon: ({ color }) => <FontAwesome size={20} name="th" color={color} />,
        }}
      />
      <Tabs.Screen
        name="localisation"
        options={{
          title: 'localisation',
          tabBarIcon: ({ color }) => <FontAwesome size={20} name="map" color={color} />,
        }}
      />
    </Tabs>
  );
}
