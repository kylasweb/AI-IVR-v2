import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Icon from 'react-native-vector-icons/MaterialIcons';
// TODO: Implement proper mobile app structure
// @ts-ignore
const store = {};
// @ts-ignore
const persistor = {};
// @ts-ignore
const PushNotificationService = { getInstance: () => ({ initialize: async () => {} }) };

// TODO: Implement actual screen components
const SplashScreen = () => null;
const LoginScreen = () => null;
const HomeScreen = () => null;
const CallScreen = () => null;
const ChatScreen = () => null;
const ContactsScreen = () => null;
const SettingsScreen = () => null;
const ProfileScreen = () => null;
const NotificationsScreen = () => null;
const HistoryScreen = () => null;
const AppointmentsScreen = () => null;
const SupportScreen = () => null;
const LanguageScreen = () => null;
const PrivacyScreen = () => null;
const AboutScreen = () => null;

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  Call: {
    callerName: string;
    callerNumber: string;
    callerAvatar?: string;
    callType: 'incoming' | 'outgoing' | 'active';
  };
  Chat: {
    conversationId: string;
    contactName: string;
  };
  Profile: undefined;
  Notifications: undefined;
  Language: undefined;
  Privacy: undefined;
  About: undefined;
  Support: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Contacts: undefined;
  Appointments: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home';
              break;
            case 'History':
              iconName = focused ? 'history' : 'history';
              break;
            case 'Contacts':
              iconName = focused ? 'contacts' : 'contacts';
              break;
            case 'Appointments':
              iconName = focused ? 'event' : 'event';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
        }}
      />
      <Tab.Screen 
        name="Contacts" 
        component={ContactsScreen}
        options={{
          tabBarLabel: 'Contacts',
        }}
      />
      <Tab.Screen 
        name="Appointments" 
        component={AppointmentsScreen}
        options={{
          tabBarLabel: 'Appointments',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => ({
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width, 0],
                }),
              },
            ],
          },
        }),
      }}
    >
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen}
        options={{
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen 
        name="Auth" 
        component={LoginScreen}
        options={{
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen 
        name="Main" 
        component={MainTabNavigator}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="Call" 
        component={CallScreen}
        options={{
          presentation: 'fullScreenModal',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
      />
      <Stack.Screen 
        name="Language" 
        component={LanguageScreen}
      />
      <Stack.Screen 
        name="Privacy" 
        component={PrivacyScreen}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen}
      />
      <Stack.Screen 
        name="Support" 
        component={SupportScreen}
      />
    </Stack.Navigator>
  );
};

const App: React.FC = () => {
  React.useEffect(() => {
    // Initialize push notification service
    const initializePushNotifications = async () => {
      try {
        const pushService = PushNotificationService.getInstance();
        await pushService.initialize();
        console.log('Push notifications initialized successfully');
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      }
    };

    initializePushNotifications();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;