import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NotificationPreferences } from '../push-notification-service';

interface MobileSettingsProps {
  preferences: NotificationPreferences;
  onUpdatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  onNavigateBack: () => void;
  language: 'ml' | 'en' | 'manglish';
}

const MobileSettings: React.FC<MobileSettingsProps> = ({
  preferences,
  onUpdatePreferences,
  onNavigateBack,
  language,
}) => {
  const insets = useSafeAreaInsets();

  const getLocalizedText = (key: string): string => {
    const texts = {
      settings: {
        ml: 'ക്രമീകരണങ്ങൾ',
        en: 'Settings',
        manglish: 'Settings'
      },
      notifications: {
        ml: 'അറിയിപ്പുകൾ',
        en: 'Notifications',
        manglish: 'Notifications'
      },
      enablePush: {
        ml: 'പുഷ് അറിയിപ്പുകൾ സാധ്യമാക്കുക',
        en: 'Enable Push Notifications',
        manglish: 'Push notifications enable cheyyuka'
      },
      callNotifications: {
        ml: 'കോൾ അറിയിപ്പുകൾ',
        en: 'Call Notifications',
        manglish: 'Call notifications'
      },
      messageNotifications: {
        ml: 'സന്ദേശ അറിയിപ്പുകൾ',
        en: 'Message Notifications',
        manglish: 'Message notifications'
      },
      appointmentNotifications: {
        ml: 'അപ്പോയിന്റ്മെന്റ് അറിയിപ്പുകൾ',
        en: 'Appointment Notifications',
        manglish: 'Appointment notifications'
      },
      marketingNotifications: {
        ml: 'മാർക്കറ്റിംഗ് അറിയിപ്പുകൾ',
        en: 'Marketing Notifications',
        manglish: 'Marketing notifications'
      },
      soundAndVibration: {
        ml: 'ശബ്ദവും വൈബ്രേഷനും',
        en: 'Sound & Vibration',
        manglish: 'Sound & Vibration'
      },
      enableSound: {
        ml: 'ശബ്ദം സാധ്യമാക്കുക',
        en: 'Enable Sound',
        manglish: 'Sound enable cheyyuka'
      },
      enableVibration: {
        ml: 'വൈബ്രേഷൻ സാധ്യമാക്കുക',
        en: 'Enable Vibration',
        manglish: 'Vibration enable cheyyuka'
      },
      quietHours: {
        ml: 'നിശബ്ദ സമയം',
        en: 'Quiet Hours',
        manglish: 'Quiet hours'
      },
      language: {
        ml: 'ഭാഷ',
        en: 'Language',
        manglish: 'Bhasha'
      },
      malayalam: {
        ml: 'മലയാളം',
        en: 'Malayalam',
        manglish: 'Malayalam'
      },
      english: {
        ml: 'ഇംഗ്ലീഷ്',
        en: 'English',
        manglish: 'English'
      },
      manglish: {
        ml: 'മംഗ്ലീഷ്',
        en: 'Manglish',
        manglish: 'Manglish'
      },
      privacy: {
        ml: 'സ്വകാര്യത',
        en: 'Privacy',
        manglish: 'Privacy'
      },
      dataUsage: {
        ml: 'ഡാറ്റ ഉപയോഗം',
        en: 'Data Usage',
        manglish: 'Data usage'
      },
      clearCache: {
        ml: 'കാഷ് മായ്ക്കുക',
        en: 'Clear Cache',
        manglish: 'Cache clear cheyyuka'
      },
      about: {
        ml: 'കുറിച്ച്',
        en: 'About',
        manglish: 'About'
      },
      version: {
        ml: 'പതിപ്പ്',
        en: 'Version',
        manglish: 'Version'
      },
      support: {
        ml: 'പിന്തുണ',
        en: 'Support',
        manglish: 'Support'
      }
    };

    return texts[key as keyof typeof texts]?.[language] || texts[key as keyof typeof texts]?.en || key;
  };

  const renderSettingItem = (
    title: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    subtitle?: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
        thumbColor={value ? '#FFFFFF' : '#F5F5F5'}
      />
    </View>
  );

  const renderLanguageSelector = () => (
    <View style={styles.languageContainer}>
      <Text style={styles.sectionTitle}>{getLocalizedText('language')}</Text>
      <View style={styles.languageOptions}>
        {(['ml', 'en', 'manglish'] as const).map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[
              styles.languageOption,
              preferences.preferredLanguage === lang && styles.languageOptionSelected
            ]}
            onPress={() => onUpdatePreferences({ preferredLanguage: lang })}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.languageOptionText,
              preferences.preferredLanguage === lang && styles.languageOptionTextSelected
            ]}>
              {getLocalizedText(lang)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderActionItem = (title: string, icon: string, onPress: () => void) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.actionContent}>
        <Icon name={icon} size={24} color="#666666" />
        <Text style={styles.actionTitle}>{title}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#CCCCCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={onNavigateBack} activeOpacity={0.7}>
          <Icon name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getLocalizedText('settings')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getLocalizedText('notifications')}</Text>
          
          {renderSettingItem(
            getLocalizedText('enablePush'),
            preferences.enablePushNotifications,
            (value) => onUpdatePreferences({ enablePushNotifications: value }),
            'Receive notifications on this device'
          )}

          {preferences.enablePushNotifications && (
            <>
              {renderSettingItem(
                getLocalizedText('callNotifications'),
                preferences.enableCallNotifications,
                (value) => onUpdatePreferences({ enableCallNotifications: value }),
                'Incoming call alerts and notifications'
              )}

              {renderSettingItem(
                getLocalizedText('messageNotifications'),
                preferences.enableMessageNotifications,
                (value) => onUpdatePreferences({ enableMessageNotifications: value }),
                'Chat messages and SMS alerts'
              )}

              {renderSettingItem(
                getLocalizedText('appointmentNotifications'),
                preferences.enableAppointmentNotifications,
                (value) => onUpdatePreferences({ enableAppointmentNotifications: value }),
                'Appointment reminders and updates'
              )}

              {renderSettingItem(
                getLocalizedText('marketingNotifications'),
                preferences.enableMarketingNotifications,
                (value) => onUpdatePreferences({ enableMarketingNotifications: value }),
                'Promotional offers and updates'
              )}
            </>
          )}
        </View>

        {/* Sound & Vibration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getLocalizedText('soundAndVibration')}</Text>
          
          {renderSettingItem(
            getLocalizedText('enableSound'),
            preferences.soundEnabled,
            (value) => onUpdatePreferences({ soundEnabled: value }),
            'Play notification sounds'
          )}

          {renderSettingItem(
            getLocalizedText('enableVibration'),
            preferences.vibrationEnabled,
            (value) => onUpdatePreferences({ vibrationEnabled: value }),
            'Vibrate for notifications'
          )}
        </View>

        {/* Language Selection */}
        {renderLanguageSelector()}

        {/* Quiet Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getLocalizedText('quietHours')}</Text>
          <View style={styles.quietHoursContainer}>
            <TouchableOpacity style={styles.timeButton} activeOpacity={0.7}>
              <Text style={styles.timeLabel}>Start:</Text>
              <Text style={styles.timeValue}>
                {preferences.quietHoursStart || '22:00'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timeButton} activeOpacity={0.7}>
              <Text style={styles.timeLabel}>End:</Text>
              <Text style={styles.timeValue}>
                {preferences.quietHoursEnd || '08:00'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy & Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getLocalizedText('privacy')}</Text>
          
          {renderActionItem(
            getLocalizedText('dataUsage'),
            'data-usage',
            () => console.log('Navigate to data usage')
          )}

          {renderActionItem(
            getLocalizedText('clearCache'),
            'clear-all',
            () => console.log('Clear cache')
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getLocalizedText('about')}</Text>
          
          {renderActionItem(
            `${getLocalizedText('version')} 1.0.0`,
            'info',
            () => console.log('Show version info')
          )}

          {renderActionItem(
            getLocalizedText('support'),
            'help',
            () => console.log('Navigate to support')
          )}
        </View>

        {/* Extra space at bottom */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  languageContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    paddingVertical: 10,
  },
  languageOptions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  languageOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  languageOptionSelected: {
    backgroundColor: '#4CAF50',
  },
  languageOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  languageOptionTextSelected: {
    color: '#FFFFFF',
  },
  quietHoursContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666666',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 15,
  },
  bottomSpacer: {
    height: 50,
  },
});

export default MobileSettings;