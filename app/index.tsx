import Welcome from '@/templates/Welcome';
import { Stack } from 'expo-router';

const Home = () => (
  <>
    <Stack.Screen options={{ title: 'Notification App' }} />
    <Welcome />
  </>
);

export default Home;
