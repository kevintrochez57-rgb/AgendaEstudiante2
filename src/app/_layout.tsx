import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* Pantalla de inicio */}
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Inicio',
          headerShown: false
        }} 
      />
      
      {/* Grupo de tabs */}
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false
        }} 
      />
    </Stack>
  );
}
