import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Layout() {
  return (
    <Drawer drawerContent={() => 
        <DrawerContentScrollView>
            <DrawerItem 
                label={'Home'} 
                onPress={() => {
                    router.push('/(drawer)/(tabs)');
                }}
                icon={({ color, size }) => (
                    <Ionicons name={'home-outline'} color={color} size={size} />
                )}
            />
            <DrawerItem 
                label={'About'} 
                onPress={() => {
                    router.push('/(drawer)/(tabs)/about');
                }}
                icon={({ color, focused, size }) => (
                    <Ionicons name={focused ? 'information-circle' : 'information-circle-outline'} color={color} size={size} />
                )}
            />

            <DrawerItem 
                label={'Camera'} 
                onPress={() => {
                    router.push('/(drawer)/(tabs)/camera');
                }}
                icon={({ color, focused, size }) => (
                    <Ionicons name={"camera-outline"} color={color} size={size} />
                )}
            />

            <DrawerItem 
                label={'Audio'} 
                onPress={() => {
                    router.push('/(drawer)/(tabs)/enregistrement_audio');
                }}
                icon={({ color, focused, size }) => (
                    <Ionicons name={"caret-forward-outline"} color={color} size={size} />
                )}
            />

            <DrawerItem 
                label={'connexion'} 
                onPress={() => {
                    router.push('/(drawer)/(tabs)/connexion');
                }}
                icon={({ color, focused, size }) => (
                    <Ionicons name={"wifi"} color={color} size={size} />
                )}
            />
            <DrawerItem 
                label={'Localisation'} 
                onPress={() => {
                    router.push('/(drawer)/(tabs)/localisation');
                }}
                icon={({ color, focused, size }) => (
                    <Ionicons name={"map"} color={color} size={size} />
                )}
            />
            <DrawerItem 
                label={'contact'} 
                onPress={() => {
                    router.push('/(drawer)/(tabs)/contact');
                }}
                icon={({ color, focused, size }) => (
                    <Ionicons name={"funnel"} color={color} size={size} />
                )}
            />
            <DrawerItem 
                label={'facultes'} 
                onPress={() => {
                    router.push('/(drawer)/facultes');  
                }}
                icon={({ color, focused, size }) => (
                    <Ionicons name={"funnel"} color={color} size={size} />
                )}
            />
            <DrawerItem 
                label={'promotion'} 
                onPress={() => {
                    router.push('/(drawer)/promotion');  
                }}
                icon={({ color, focused, size }) => (
                    <Ionicons name={"funnel"} color={color} size={size} />
                )}
            />
        </DrawerContentScrollView>}>

        <Drawer.Screen name="(tabs)" options={{title: ""}} />
    </Drawer>
  );
}
