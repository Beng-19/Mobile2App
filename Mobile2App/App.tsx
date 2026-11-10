import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppTabs from './src/components/AppTabs';
import { initDatabase } from './src/components/database';

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();
      } catch (error) {
        console.log('Database error:', error);
      } finally {
        setLoading(false);
      }
    };

    setup();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text>Đang khởi tạo dữ liệu...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppTabs />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
});

export default App;