# AI IVR Malayalam Platform - Deployment Guide

🎉 **Malayalam AI IVR Platform with Manglish Support!**

This comprehensive guide covers deployment of the Malayalam-first AI IVR platform with full Manglish (Malayalam in English script) support.

## 🌟 Key Features

### 🗣️ **Language Support**

- **Primary Language**: Malayalam (മലയാളം)
- **Manglish Support**: Full support for Malayalam written in English script
- **Dialect Support**:
  - Standard Malayalam
  - Travancore dialect
  - Malabar dialect
  - Cochin dialect

### 🤖 **AI Capabilities**

- **Malayalam Speech-to-Text**: Advanced recognition for Malayalam speech
- **Malayalam Text-to-Speech**: Natural voice synthesis
- **Manglish Processing**: Intelligent Manglish to Malayalam conversion
- **Intent Recognition**: Context-aware Malayalam intent detection
- **Cultural Context**: Understanding of Malayalam cultural nuances
- **Cultural Considerations AI**: Comprehensive cultural awareness system for respectful interactions

### 🎭 **Cultural Considerations AI Features**

- **Respect Level Detection**: Automatically detects formal/informal address patterns
- **Family Hierarchy Recognition**: Understands Malayalam family relationship dynamics
- **Religious Context Awareness**: Recognizes and responds appropriately to religious references
- **Festival Context Detection**: Identifies festival mentions and provides appropriate greetings
- **Age-Appropriate Communication**: Adjusts language based on age-related respect markers
- **Regional Dialect Adaptation**: Recognizes different Kerala regional dialects
- **Social Etiquette Compliance**: Ensures culturally appropriate responses
- **Gender-Sensitive Communication**: Respectful interaction based on gender considerations
- **Traditional Occupation Recognition**: Understands references to traditional Kerala occupations
- **Caste and Community Sensitivity**: Handles social hierarchy with appropriate respect

### 🎛️ **Features**

- **Multi-language UI**: Malayalam, Manglish, and English interfaces
- **Regional Variations**: Support for different Malayalam dialects
- **Respect Levels**: Formal and informal address modes
- **Emergency Support**: Priority handling for Malayalam emergency calls
- **Cultural Intelligence**: Advanced cultural context analysis and response generation
- **Festival-Aware Responses**: Automatic festival greetings and cultural acknowledgments
- **Hierarchy-Sensitive Communication**: Appropriate responses based on social and family hierarchy

## 🚀 Quick Deployment

### Option 1: Render.com (Recommended for Malayalam Platform)

```bash
# Install Render CLI
npm install -g @render/cli
render login

# Deploy Malayalam platform
./scripts/deploy-malayalam.sh
```

### Option 2: Docker (Local Testing)

```bash
# Build and start Malayalam services
./scripts/docker-deploy-malayalam.sh build
./scripts/docker-deploy-malayalam.sh start

# Access at http://localhost:3000
```

## 📁 Malayalam-Specific Files

### Backend Services

- `ivr-backend/services/speech_to_text_ml.py` - Malayalam speech recognition
- `ivr-backend/services/text_to_speech_ml.py` - Malayalam voice synthesis
- `ivr-backend/services/nlp_service_ml.py` - Malayalam NLP and intent recognition
- `ivr-backend/services/conversation_manager_ml.py` - Malayalam conversation flows
- `ivr-backend/services/manglish_service.py` - Manglish processing service
- `ivr-backend/main-ml.py` - Malayalam-first backend

### Configuration Files

- `render-ml.yaml` - Render.com configuration for Malayalam platform
- `ivr-backend/render-ml.yaml` - Backend-specific Malayalam configuration
- `.env.production-ml.example` - Malayalam environment variables
- `ivr-backend/requirements-ml.txt` - Malayalam-specific dependencies

### Frontend

- `src/app/page.tsx` - Updated with Malayalam UI support
- Malayalam language selection and dialect support
- Localized interface elements

## 🌐 Malayalam Language Configuration

### Supported Languages

1. **മലയാളം (Malayalam)**

   - Standard dialect
   - Travancore dialect
   - Malabar dialect
   - Cochin dialect

2. **മംഗ്ലീഷ് (Manglish)**

   - Standard Manglish
   - Casual Manglish
   - Formal Manglish

3. **English**
   - Standard English
   - US English
   - UK English

### UI Text Translations

The platform includes complete UI translations for:

- Navigation elements
- Status messages
- Error messages
- Success notifications
- Form labels and buttons
- Cultural context indicators
- Respect level indicators
- Festival greetings
- Regional customizations

## 🎭 Cultural Considerations Dataset

### Malayalam Cultural Intent Dataset

The AI agent includes a comprehensive dataset for cultural considerations with the following categories:

#### **Respectful Communication Patterns**

- **Formal Address**: സർ, മാം, മാഷ്, താങ്കൾ, അവിടുന്ന്
- **Informal Address**: ചേട്ടാ, ചേച്ചി, മോനേ, മോളേ
- **Ultra Respectful**: തിരുമുമ്പിൽ, ബഹുമാനപൂർവം, ആദരവോടെ

#### **Family Hierarchy Recognition**

- **Elders**: മുത്തശ്ശൻ, മുത്തശ്ശി, വലിയച്ഛൻ, വലിയമ്മ
- **Parents**: അച്ഛൻ, അമ്മ, അപ്പൻ, അമ്മച്ചി
- **Siblings**: അഗ്രജൻ, അണിയൻ, ചേച്ചി, ചേട്ടൻ
- **Extended Family**: മാമൻ, മാമി, അമ്മാവൻ, അമ്മായി

#### **Religious Context Awareness**

- **Hindu Greetings**: ഓം നമഃ ശിവായ, ഹരേ കൃഷ്ണ, ജയ് ശ്രീ രാം
- **Islamic Greetings**: അസ്സലാമു അലൈകും, വ്വലൈകുമുസ്സലാം
- **Christian Greetings**: യേശുവിന്റെ അനുഗ്രഹം, ക്രിസ്തുവിന്റെ സമാധാനം

#### **Festival and Celebration Context**

- **Major Festivals**: ഓണം, വിഷു, ദീപാവലി, ഈദ്, ക്രിസ്മസ്
- **Regional Festivals**: തൃശ്ശൂർ പൂരം, പദ്മനാഭസ്വാമി ആരാട്ട്
- **Seasonal Celebrations**: നവരാത്രി, ദുർഗാഷ്ടമി, തിരുവാതിര

#### **Regional Dialect Patterns**

- **Thiruvithamkoor**: തിരുവിതാംകൂർ ഭാഷാ പാറ്റേൺ
- **Malabar**: മലബാർ പ്രാദേശിക ഭാഷ
- **Cochin**: കൊച്ചി നഗര ഭാഷ
- **Central Kerala**: മധ്യകേരള ഭാഷാ വൈവിധ്യം

#### **Age-Appropriate Communication**

- **To Elders**: വൃദ്ധജനങ്ങളോടുള്ള ആദരവ്
- **To Peers**: സമപ്രായക്കാരുമായുള്ള സംവാദം
- **To Younger**: ഇളയവരോടുള്ള സ്നേഹപൂർവമായ സമീപനം

#### **Social Etiquette Patterns**

- **Guest Treatment**: അതിഥി ദേവോ ഭവ
- **Gender Respect**: സ്ത്രീകളോടുള്ള ആദരവ്
- **Professional Courtesy**: ഔദ്യോഗിക മര്യാദകൾ

### English Cultural Context Dataset

#### **Kerala Cultural References in English**

- **Festival Names**: Onam, Vishu, Thrissur Pooram, Padmanabhaswamy Temple
- **Traditional Terms**: Sadhya, Kathakali, Mohiniyattam, Kalaripayattu
- **Regional References**: God's Own Country, Backwaters, Spice Gardens

#### **Respectful Communication in English**

- **Formal Address**: Respected Sir/Madam, Honorable, Esteemed
- **Cultural Sensitivity**: Understanding of Malayalam customs in English
- **Religious Sensitivity**: Appropriate responses to Hindu, Christian, Muslim contexts

### Manglish Cultural Patterns

#### **Transliterated Respectful Terms**

- **Formal**: sir, mam, mash, thankall, avidunnu
- **Family**: achan, amma, chetan, chechi, muthassi
- **Religious**: namaskaram, daivathinte anugrahom, bhagavante kripa

#### **Cultural Intelligence Features**

1. **Automatic Politeness Detection**: Identifies formal vs informal language patterns
2. **Cultural Context Scoring**: Assigns sensitivity scores to conversations
3. **Regional Adaptation**: Adjusts responses based on detected regional markers
4. **Festival Awareness**: Provides appropriate greetings during festivals
5. **Age-Appropriate Responses**: Modifies language complexity and respect levels
6. **Religious Sensitivity**: Handles religious contexts with appropriate reverence
7. **Family Hierarchy Respect**: Maintains proper family relationship protocols
8. **Gender-Sensitive Communication**: Ensures respectful gender-appropriate responses

## 🔧 Malayalam Service Configuration

### Speech Recognition

```python
# Malayalam language variants
malayalam_variants = {
    'ml': 'ml-IN',  # Malayalam (India)
    'ml-in': 'ml-IN',
    'malayalam': 'ml-IN'
}

# Common Malayalam phrases for better recognition
malayalam_phrases = {
    'greetings': ['നമസ്കാരം', 'ഹായ്', 'സുഖം'],
    'help': ['സഹായം', 'സഹായം തേടുക'],
    'billing': ['ബിൽ', 'പേയ്‌മെന്റ്', 'ചാർജ്'],
    'technical': ['സാങ്കേതിക', 'ടെക്നിക്കൽ', 'പ്രശ്നം']
}
```

### Text-to-Speech

```python
# Malayalam pronunciation mappings
pronunciation_map = {
    'നമസ്കാരം': 'namaskaaram',
    'സുഖം': 'sukham',
    'എങ്ങനെ': 'engane',
    'സഹായം': 'sahayam'
}

# Emotion-based speech parameters
emotion_params = {
    'happy': {'rate': 160, 'volume': 0.95},
    'formal': {'rate': 140, 'volume': 0.85},
    'professional': {'rate': 140, 'volume': 0.85}
}
```

### Manglish Processing

```python
# Comprehensive Manglish to Malayalam mapping
manglish_to_malayalam_map = {
    "namaskaram": "നമസ്കാരം",
    "hai": "ഹായ്",
    "sukham": "സുഖം",
    "engane irikkunnu": "എങ്ങനെ ഇരിക്കുന്നു",
    "sahayam": "സഹായം",
    "athe": "അതെ",
    "alla": "അല്ല"
}
```

## 🎛️ Deployment Configuration

### Render.com Environment Variables

#### Frontend

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://ai-ivr-malayalam-backend.onrender.com
NEXT_PUBLIC_PRIMARY_LANGUAGE=malayalam
NEXT_PUBLIC_SUPPORTS_MANGLISH=true
NEXT_PUBLIC_DEFAULT_DIALECT=standard
```

#### Backend

```env
PORT=10000
ENVIRONMENT=production
PRIMARY_LANGUAGE=malayalam
SUPPORTS_MANGLISH=true
ALLOWED_ORIGINS=https://ai-ivr-malayalam-frontend.onrender.com
```

### Docker Configuration

```yaml
# docker-compose-malayalam.yml
version: "3.8"

services:
  malayalam-frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_PRIMARY_LANGUAGE=malayalam
      - NEXT_PUBLIC_SUPPORTS_MANGLISH=true
    depends_on:
      - malayalam-backend

  malayalam-backend:
    build: ./ivr-backend
    ports:
      - "10000:10000"
    environment:
      - PRIMARY_LANGUAGE=malayalam
      - SUPPORTS_MANGLISH=true
```

## 🎯 Cultural Considerations

### Respect Levels

- **Formal**: സർ, മാഷ്, ചേട്ടൻ, ചേച്ചി
- **Informal**: മോനേ, മോളേ, എടാ, എടി
- **Neutral**: Standard respectful address

### Regional Variations

- **Travancore**: ഞാൾ, നിങ്ങൾ
- **Malabar**: നിങ്ങളെ, അവർ
- **Cochin**: നിങ്ങളെ, അവർ

### Emergency Handling

Priority support for Malayalam emergency calls:

- Medical emergencies: ആശുപത്രി, ഡോക്ടർ
- Police: പോലീസ്, സ്റ്റേഷൻ
- Fire: ഫയർ, അഗ്നിശമനം

## 📊 Monitoring and Analytics

### Malayalam-Specific Metrics

- Language usage distribution
- Dialect preference analytics
- Manglish vs Malayalam usage
- Regional usage patterns
- Cultural context accuracy

### Call Quality Metrics

- Malayalam speech recognition accuracy
- Manglish conversion success rate
- Dialect detection accuracy
- Response time for Malayalam processing

## 🔍 Testing Malayalam Features

### Speech Recognition Testing

```bash
# Test Malayalam phrases
curl -X POST http://localhost:8000/api/malayalam/phrases

# Test Manglish validation
curl "http://localhost:8000/api/manglish/validate?text=namaskaram%20sahayam%20vendam"
```

### UI Testing

1. Select Malayalam language in the interface
2. Test different dialects
3. Test Manglish input
4. Verify cultural context responses

## 🐛 Troubleshooting

### Common Malayalam Issues

1. **Speech Recognition Not Working**

   - Check microphone permissions
   - Verify Malayalam language pack installation
   - Test with clear Malayalam pronunciation

2. **Manglish Not Converting**

   - Check Manglish service health
   - Verify spelling of Manglish words
   - Test with common Manglish phrases

3. **Font Display Issues**

   - Ensure Malayalam fonts are loaded
   - Check browser font support
   - Verify UTF-8 encoding

4. **Dialect Detection Issues**
   - Test with clear dialect-specific phrases
   - Check dialect configuration
   - Verify regional accent patterns

### Debug Commands

```bash
# Check Malayalam service health
curl http://localhost:8000/health

# Test language support
curl http://localhost:8000/api/languages

# Check active sessions with language info
curl http://localhost:8000/api/sessions
```

## 📚 Additional Resources

### Malayalam NLP Resources

- [Malayalam Computing](https://malayalamcomputing.org)
- [Indic NLP Library](https://github.com/anoopkunchukuttan/indic_nlp_library)
- [Malayalam Speech Recognition](https://github.com/aicfactory/ASR-for-Malayalam)

### Manglish Resources

- [Manglish Processing](https://github.com/malayalam-computing/manglish)
- [Malayalam Transliteration](https://github.com/libindic/transliteration)

### Deployment

- [Render Documentation](https://render.com/docs)
- [Docker Malayalam Support](https://docs.docker.com)

## 🆘 Support

For Malayalam-specific issues:

1. **Language Issues**: Check Malayalam service logs
2. **Manglish Problems**: Verify Manglish service configuration
3. **Cultural Context**: Review conversation flows
4. **Deployment**: Check environment variables

---

**Note**: This Malayalam-first AI IVR platform is designed specifically for Malayalam-speaking users with full Manglish support. The system understands cultural nuances, regional dialects, and provides a truly localized experience. 🇮🇳

**Success Metrics**:

- Malayalam speech recognition accuracy: >90%
- Manglish conversion accuracy: >85%
- User satisfaction in Malayalam: >95%
- Regional dialect support: 4 major dialects
