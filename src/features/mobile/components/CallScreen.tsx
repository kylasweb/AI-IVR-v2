import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CallScreenProps {
  callerName: string;
  callerNumber: string;
  callerAvatar?: string;
  callType: 'incoming' | 'outgoing' | 'active';
  language: 'ml' | 'en' | 'manglish';
  onAnswer?: () => void;
  onDecline?: () => void;
  onHangup?: () => void;
  onMute?: () => void;
  onSpeaker?: () => void;
  onKeypad?: () => void;
  isMuted?: boolean;
  isSpeakerOn?: boolean;
  callDuration?: number;
  isConnected?: boolean;
}

const { width, height } = Dimensions.get('window');

const CallScreen: React.FC<CallScreenProps> = ({
  callerName,
  callerNumber,
  callerAvatar,
  callType,
  language,
  onAnswer,
  onDecline,
  onHangup,
  onMute,
  onSpeaker,
  onKeypad,
  isMuted = false,
  isSpeakerOn = false,
  callDuration = 0,
  isConnected = false,
}) => {
  const insets = useSafeAreaInsets();
  const pulseAnimation = new Animated.Value(1);

  React.useEffect(() => {
    if (callType === 'incoming') {
      startPulseAnimation();
    }
  }, [callType]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const formatCallDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getLocalizedText = (key: string): string => {
    const texts = {
      incoming: {
        ml: 'വരുന്ന കോൾ',
        en: 'Incoming Call',
        manglish: 'Incoming Call'
      },
      outgoing: {
        ml: 'ഔട്ട്ഗോയിംഗ് കോൾ',
        en: 'Outgoing Call',
        manglish: 'Call cheyyunnu'
      },
      connected: {
        ml: 'കണക്റ്റ് ചെയ്തു',
        en: 'Connected',
        manglish: 'Connected'
      },
      answer: {
        ml: 'ഉത്തരം',
        en: 'Answer',
        manglish: 'Answer'
      },
      decline: {
        ml: 'നിരസിക്കുക',
        en: 'Decline',
        manglish: 'Decline'
      },
      hangup: {
        ml: 'കാൾ അവസാനിപ്പിക്കുക',
        en: 'Hang Up',
        manglish: 'Cut cheyyuka'
      },
      mute: {
        ml: 'നിശബ്ദം',
        en: 'Mute',
        manglish: 'Mute'
      },
      speaker: {
        ml: 'സ്പീക്കർ',
        en: 'Speaker',
        manglish: 'Speaker'
      },
      keypad: {
        ml: 'കീപാഡ്',
        en: 'Keypad',
        manglish: 'Keypad'
      }
    };

    return texts[key as keyof typeof texts]?.[language] || texts[key as keyof typeof texts]?.en || key;
  };

  const renderCallStatus = () => {
    let statusText = '';
    let statusColor = '#FFFFFF';

    switch (callType) {
      case 'incoming':
        statusText = getLocalizedText('incoming');
        statusColor = '#4CAF50';
        break;
      case 'outgoing':
        statusText = getLocalizedText('outgoing');
        statusColor = '#FF9800';
        break;
      case 'active':
        statusText = isConnected ? getLocalizedText('connected') : formatCallDuration(callDuration);
        statusColor = '#4CAF50';
        break;
    }

    return (
      <Text style={[styles.callStatus, { color: statusColor }]}>
        {statusText}
      </Text>
    );
  };

  const renderAvatar = () => {
    if (callerAvatar) {
      return (
        <Animated.View style={[
          styles.avatarContainer,
          { transform: [{ scale: pulseAnimation }] }
        ]}>
          <Image source={{ uri: callerAvatar }} style={styles.avatar} alt={`Avatar of ${callerName}`} />
        </Animated.View>
      );
    }

    return (
      <Animated.View style={[
        styles.avatarContainer,
        styles.defaultAvatar,
        { transform: [{ scale: pulseAnimation }] }
      ]}>
        <Icon name="person" size={80} color="#FFFFFF" />
      </Animated.View>
    );
  };

  const renderIncomingCallButtons = () => (
    <View style={styles.incomingButtonsContainer}>
      <TouchableOpacity
        style={[styles.callButton, styles.declineButton]}
        onPress={onDecline}
        activeOpacity={0.8}
      >
        <Icon name="call-end" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.callButton, styles.answerButton]}
        onPress={onAnswer}
        activeOpacity={0.8}
      >
        <Icon name="call" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderActiveCallButtons = () => (
    <View style={styles.activeButtonsContainer}>
      {/* Top row buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.actionButton, isMuted && styles.actionButtonActive]}
          onPress={onMute}
          activeOpacity={0.8}
        >
          <Icon name={isMuted ? "mic-off" : "mic"} size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>{getLocalizedText('mute')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onKeypad}
          activeOpacity={0.8}
        >
          <Icon name="dialpad" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>{getLocalizedText('keypad')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, isSpeakerOn && styles.actionButtonActive]}
          onPress={onSpeaker}
          activeOpacity={0.8}
        >
          <Icon name="volume-up" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>{getLocalizedText('speaker')}</Text>
        </TouchableOpacity>
      </View>

      {/* Hang up button */}
      <TouchableOpacity
        style={[styles.callButton, styles.hangupButton]}
        onPress={onHangup}
        activeOpacity={0.8}
      >
        <Icon name="call-end" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        backgroundColor="transparent" 
        translucent 
        barStyle="light-content" 
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={[styles.gradient, { paddingTop: insets.top }]}
      >
        {/* Call Info */}
        <View style={styles.callInfo}>
          {renderCallStatus()}
          
          {renderAvatar()}
          
          <Text style={styles.callerName} numberOfLines={2}>
            {callerName}
          </Text>
          
          <Text style={styles.callerNumber}>
            {callerNumber}
          </Text>
        </View>

        {/* Call Buttons */}
        <View style={styles.buttonsContainer}>
          {callType === 'incoming' ? 
            renderIncomingCallButtons() : 
            renderActiveCallButtons()
          }
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
  },
  callInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  callStatus: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 40,
    textAlign: 'center',
  },
  avatarContainer: {
    marginBottom: 30,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  defaultAvatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callerName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  callerNumber: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  buttonsContainer: {
    paddingBottom: 50,
  },
  incomingButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  activeButtonsContainer: {
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  callButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  answerButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#F44336',
  },
  hangupButton: {
    backgroundColor: '#F44336',
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default CallScreen;