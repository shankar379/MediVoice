import * as Speech from 'expo-speech';
import { VoiceSettings, MedicineAssignment } from '../types';

class VoiceService {
  private isSpeaking = false;

  // Generate voice message based on medicine assignment and user settings
  generateReminderMessage(
    assignment: MedicineAssignment,
    userName: string,
    voiceSettings: VoiceSettings
  ): string {
    const { medicineName, dosage, color, shape, instructions } = assignment;
    const { language, personalization } = voiceSettings;

    let message = '';

    // Add personalized greeting if enabled
    if (personalization.useName && userName) {
      message += this.getGreeting(language, userName) + ' ';
    }

    // Add medicine reminder
    message += this.getMedicineReminder(language, medicineName, dosage);

    // Add color and shape if available
    if (color || shape) {
      message += ' ' + this.getColorShape(language, color, shape);
    }

    // Add instructions if available
    if (instructions) {
      message += ' ' + this.getInstructions(language, instructions);
    }

    return message;
  }

  // Speak the reminder message
  async speakReminder(
    message: string,
    voiceSettings: VoiceSettings,
    onComplete?: () => void
  ): Promise<void> {
    if (this.isSpeaking) {
      await this.stopSpeaking();
    }

    try {
      this.isSpeaking = true;
      
      await Speech.speak(message, {
        language: voiceSettings.language,
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        volume: voiceSettings.volume,
        onDone: () => {
          this.isSpeaking = false;
          onComplete?.();
        },
        onError: (error: any) => {
          console.error('Speech error:', error);
          this.isSpeaking = false;
          onComplete?.();
        },
      });
    } catch (error) {
      console.error('Speech error:', error);
      this.isSpeaking = false;
      onComplete?.();
    }
  }

  // Stop current speech
  async stopSpeaking(): Promise<void> {
    if (this.isSpeaking) {
      await Speech.stop();
      this.isSpeaking = false;
    }
  }

  // Test voice with sample message
  async testVoice(voiceSettings: VoiceSettings): Promise<void> {
    const testMessage = this.getTestMessage(voiceSettings.language);
    await this.speakReminder(testMessage, voiceSettings);
  }

  // Get greeting in different languages
  private getGreeting(language: string, userName: string): string {
    const greetings: { [key: string]: string } = {
      'en-IN': `Hello ${userName}`,
      'hi-IN': `नमस्ते ${userName}`,
      'te-IN': `హలో ${userName}`,
      'ta-IN': `வணக்கம் ${userName}`,
      'kn-IN': `ನಮಸ್ಕಾರ ${userName}`,
      'ml-IN': `ഹലോ ${userName}`,
    };
    return greetings[language] || greetings['en-IN'];
  }

  // Get medicine reminder message
  private getMedicineReminder(language: string, medicineName: string, dosage: string): string {
    const reminders: { [key: string]: string } = {
      'en-IN': `It's time to take your medicine: ${medicineName}, ${dosage}`,
      'hi-IN': `अब आपकी दवा लेने का समय हो गया है: ${medicineName}, ${dosage}`,
      'te-IN': `ఇప్పుడు మీ ఔషధం తీసుకునే సమయం వచ్చింది: ${medicineName}, ${dosage}`,
      'ta-IN': `இப்போது உங்கள் மருந்து எடுத்துக்கொள்ள வேண்டிய நேரம்: ${medicineName}, ${dosage}`,
      'kn-IN': `ಈಗ ನಿಮ್ಮ ಔಷಧಿ ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯ: ${medicineName}, ${dosage}`,
      'ml-IN': `ഇപ്പോൾ നിങ്ങളുടെ മരുന്ന് കഴിക്കാനുള്ള സമയം: ${medicineName}, ${dosage}`,
    };
    return reminders[language] || reminders['en-IN'];
  }

  // Get instructions message
  private getInstructions(language: string, instructions: string): string {
    const instructionPrefixes: { [key: string]: string } = {
      'en-IN': 'Instructions: ',
      'hi-IN': 'निर्देश: ',
      'te-IN': 'సూచనలు: ',
      'ta-IN': 'வழிமுறைகள்: ',
      'kn-IN': 'ಸೂಚನೆಗಳು: ',
      'ml-IN': 'നിർദ്ദേശങ്ങൾ: ',
    };
    return (instructionPrefixes[language] || instructionPrefixes['en-IN']) + instructions;
  }

  // Get test message for voice testing
  private getTestMessage(language: string): string {
    const testMessages: { [key: string]: string } = {
      'en-IN': 'Hello! This is a test of the voice reminder system.',
      'hi-IN': 'नमस्ते! यह वॉइस रिमाइंडर सिस्टम का टेस्ट है।',
      'te-IN': 'హలో! ఇది వాయిస్ రిమైండర్ సిస్టమ్ టెస్ట్.',
      'ta-IN': 'வணக்கம்! இது குரல் நினைவூட்டல் அமைப்பின் சோதனை.',
      'kn-IN': 'ನಮಸ್ಕಾರ! ಇದು ಧ್ವನಿ ನೆನಪಿಸಿಕೊಳ್ಳುವಿಕೆ ವ್ಯವಸ್ಥೆಯ ಪರೀಕ್ಷೆ.',
      'ml-IN': 'ഹലോ! ഇത് വോയ്സ് റിമൈൻഡർ സിസ്റ്റത്തിന്റെ ടെസ്റ്റാണ്.',
    };
    return testMessages[language] || testMessages['en-IN'];
  }

  // Check if speech is supported (always true for expo-speech)
  isSpeechSupported(): boolean {
    return true;
  }

  // Get available voices (if supported)
  async getAvailableVoices(): Promise<any[]> {
    try {
      return await Speech.getAvailableVoicesAsync();
    } catch (error) {
      console.error('Error getting available voices:', error);
      return [];
    }
  }

  // Add color and shape message in different languages
  private getColorShape(language: string, color?: string, shape?: string): string {
    if (!color && !shape) return '';
    const colorShapeTemplates: { [key: string]: (color?: string, shape?: string) => string } = {
      'en-IN': (color, shape) => `Color: ${color || ''}${color && shape ? ', ' : ''}${shape ? 'Shape: ' + shape : ''}`,
      'hi-IN': (color, shape) => `रंग: ${color || ''}${color && shape ? ', ' : ''}${shape ? 'आकार: ' + shape : ''}`,
      'te-IN': (color, shape) => `రంగు: ${color || ''}${color && shape ? ', ' : ''}${shape ? 'ఆకారం: ' + shape : ''}`,
      'ta-IN': (color, shape) => `நிறம்: ${color || ''}${color && shape ? ', ' : ''}${shape ? 'வடிவம்: ' + shape : ''}`,
      'kn-IN': (color, shape) => `ಬಣ್ಣ: ${color || ''}${color && shape ? ', ' : ''}${shape ? 'ಆಕಾರ: ' + shape : ''}`,
      'ml-IN': (color, shape) => `നിറം: ${color || ''}${color && shape ? ', ' : ''}${shape ? 'ആകൃതി: ' + shape : ''}`,
    };
    const template = colorShapeTemplates[language] || colorShapeTemplates['en-IN'];
    return template(color, shape);
  }
}

export default new VoiceService(); 