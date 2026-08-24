import { useState, useEffect, useRef, useCallback } from 'react';
import { PartyPlan, ShoppingItem } from '../types';
import { audioFeedback } from '../utils/audioFeedback';

export interface VoiceCommandAction {
  type: string;
  payload?: any;
}

export interface VoiceCommandResult {
  spokenReply: string;
  detectedIntent: string;
  actions: VoiceCommandAction[];
  suggestedFollowUps?: string[];
}

export interface VoiceLogEntry {
  id: string;
  timestamp: string;
  transcript: string;
  intent: string;
  spokenReply: string;
  isSuccess: boolean;
}

interface UseVoiceControlProps {
  plan: PartyPlan | null;
  currentTab: string;
  onExecuteAction: (action: VoiceCommandAction) => Promise<boolean | void> | boolean | void;
  onShowToast?: (text: string, type?: 'success' | 'error') => void;
}

export function useVoiceControl({
  plan,
  currentTab,
  onExecuteAction,
  onShowToast,
}: UseVoiceControlProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [lastSpokenReply, setLastSpokenReply] = useState<string | null>(null);
  const [lastDetectedIntent, setLastDetectedIntent] = useState<string | null>(null);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [voiceHistory, setVoiceHistory] = useState<VoiceLogEntry[]>([]);

  const recognitionRef = useRef<any>(null);
  const isContinuousRef = useRef(isContinuousMode);
  const isListeningRef = useRef(isListening);
  const isSpeakingRef = useRef(isSpeaking);
  const isMutedRef = useRef(isMuted);
  const planRef = useRef(plan);
  const currentTabRef = useRef(currentTab);

  // Keep refs synchronized
  useEffect(() => {
    isContinuousRef.current = isContinuousMode;
  }, [isContinuousMode]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    planRef.current = plan;
  }, [plan]);

  useEffect(() => {
    currentTabRef.current = currentTab;
  }, [currentTab]);

  // Check Web Speech API availability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
      }
    }
  }, []);

  // Text-To-Speech function
  const speak = useCallback((text: string) => {
    if (isMutedRef.current || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();

      // Clean markdown tags, emojis, and symbols for natural voice readout
      const cleanText = text
        .replace(/[*#_`~[\]()]/g, '')
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Select high quality English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Alex')) &&
          v.lang.startsWith('en')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis error:', err);
      setIsSpeaking(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Process and execute spoken command
  const processVoiceCommand = useCallback(
    async (rawText: string) => {
      const trimmed = rawText.trim();
      if (!trimmed) return;

      setLastCommand(trimmed);
      setIsProcessing(true);
      setError(null);

      // Fast-path client matching for instant response on standard short commands
      const lower = trimmed.toLowerCase();

      // Handle voice control internal commands
      if (lower === 'stop listening' || lower === 'turn off microphone' || lower === 'sleep') {
        setIsListening(false);
        setIsContinuousMode(false);
        if (recognitionRef.current) recognitionRef.current.stop();
        speak('Voice control paused.');
        setIsProcessing(false);
        return;
      }

      if (lower === 'mute' || lower === 'mute voice' || lower === 'quiet') {
        setIsMuted(true);
        speak('Voice feedback muted.');
        setIsProcessing(false);
        return;
      }

      if (lower === 'unmute' || lower === 'unmute voice') {
        setIsMuted(false);
        speak('Voice feedback unmuted.');
        setIsProcessing(false);
        return;
      }

      try {
        const response = await fetch('/api/voice-command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: trimmed,
            planContext: planRef.current,
            currentTab: currentTabRef.current,
          }),
        });

        const data: { success: boolean; spokenReply?: string; detectedIntent?: string; actions?: VoiceCommandAction[]; suggestedFollowUps?: string[]; error?: string } =
          await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to process voice command');
        }

        const reply = data.spokenReply || 'Command executed.';
        const intent = data.detectedIntent || 'Executed action';
        const actions = data.actions || [];

        setLastSpokenReply(reply);
        setLastDetectedIntent(intent);
        if (data.suggestedFollowUps) {
          setSuggestedFollowUps(data.suggestedFollowUps);
        }

        // Execute all parsed actions sequentially
        for (const action of actions) {
          await onExecuteAction(action);
        }

        // Play audio confirmation
        if (intent.toLowerCase().includes('brand') || intent.toLowerCase().includes('saving') || intent.toLowerCase().includes('budget')) {
          audioFeedback.playSavingsChime();
        } else {
          audioFeedback.playSuccessChime();
        }

        // Speak reply back to host
        speak(reply);

        if (onShowToast) {
          onShowToast(`🎙️ ${intent}: "${trimmed}"`, 'success');
        }

        // Log entry
        setVoiceHistory((prev) => [
          {
            id: `vlog-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            transcript: trimmed,
            intent,
            spokenReply: reply,
            isSuccess: true,
          },
          ...prev.slice(0, 19),
        ]);
      } catch (err: any) {
        console.error('Voice processing error:', err);
        audioFeedback.playErrorChime();
        const fallbackReply = `I didn't quite catch that: "${trimmed}". You can try saying "Go to shopping list", "Add buns to aisle 2", or "Switch to Curbside Pickup".`;
        setError(err.message || 'Error executing voice command');
        setLastSpokenReply(fallbackReply);
        speak(fallbackReply);

        setVoiceHistory((prev) => [
          {
            id: `vlog-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            transcript: trimmed,
            intent: 'Unrecognized Command',
            spokenReply: fallbackReply,
            isSuccess: false,
          },
          ...prev.slice(0, 19),
        ]);
      } finally {
        setIsProcessing(false);
        setTranscript('');
        setInterimTranscript('');
      }
    },
    [onExecuteAction, speak, onShowToast]
  );

  // Initialize Speech Recognition instance
  const initRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = isContinuousRef.current;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      audioFeedback.playActivationChime();
    };

    recognition.onresult = (event: any) => {
      let currentInterim = '';
      let finalTranscriptText = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscriptText += item[0].transcript;
        } else {
          currentInterim += item[0].transcript;
        }
      }

      if (currentInterim) {
        setInterimTranscript(currentInterim);
      }

      if (finalTranscriptText) {
        setTranscript(finalTranscriptText);
        setInterimTranscript('');
        processVoiceCommand(finalTranscriptText);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone permission blocked. Please allow mic access in your browser or test with simulated voice.');
        setIsListening(false);
        setIsContinuousMode(false);
      } else if (event.error !== 'no-speech') {
        setError(`Microphone notice: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // If continuous mode is on and we didn't deliberately stop, auto-restart
      if (isContinuousRef.current && isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // ignore already started error
        }
      } else {
        setIsListening(false);
      }
    };

    return recognition;
  }, [processVoiceCommand]);

  const startListening = useCallback(() => {
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      const instance = initRecognition();
      if (instance) {
        recognitionRef.current = instance;
        instance.start();
        setIsListening(true);
      }
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setError(err.message || 'Could not start microphone');
    }
  }, [initRecognition]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    setIsContinuousMode(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const toggleContinuousMode = useCallback(() => {
    const nextMode = !isContinuousMode;
    setIsContinuousMode(nextMode);
    isContinuousRef.current = nextMode;

    if (nextMode) {
      speak('Hands-free continuous mode activated. I am listening for your commands while you cook or shop.');
      if (!isListening) {
        startListening();
      }
    } else {
      speak('Continuous hands-free mode deactivated.');
    }
  }, [isContinuousMode, isListening, speak, startListening]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        stopSpeaking();
      }
      return next;
    });
  }, [stopSpeaking]);

  // Execute Simulated Voice Command (for testing or non-mic environments)
  const executeSimulatedVoice = useCallback(
    (commandText: string) => {
      audioFeedback.playActivationChime();
      setTranscript(commandText);
      processVoiceCommand(commandText);
    },
    [processVoiceCommand]
  );

  return {
    isSupported,
    isListening,
    isContinuousMode,
    isProcessing,
    isSpeaking,
    isMuted,
    transcript,
    interimTranscript,
    lastCommand,
    lastSpokenReply,
    lastDetectedIntent,
    suggestedFollowUps,
    error,
    voiceHistory,
    startListening,
    stopListening,
    toggleListening,
    toggleContinuousMode,
    toggleMute,
    speak,
    stopSpeaking,
    executeSimulatedVoice,
  };
}
