import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VoiceSearchProps {
  onResult: (city: string) => void;
  isDisabled?: boolean;
}

export const VoiceSearch = ({ onResult, isDisabled }: VoiceSearchProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice Search Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Say the name of a city.",
      });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsProcessing(true);
      
      // Clean up the transcript (remove common filler words and format)
      const cleanedCity = transcript
        .toLowerCase()
        .replace(/^(search for|find|weather in|weather for|show me|get)\s+/i, '')
        .replace(/\s+(weather|forecast|temperature)$/i, '')
        .trim();

      // Capitalize first letter of each word
      const formattedCity = cleanedCity
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      toast({
        title: "Voice Recognized",
        description: `Searching for weather in ${formattedCity}`,
      });

      onResult(formattedCity);
      setIsProcessing(false);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setIsProcessing(false);
      
      let errorMessage = "Voice recognition failed.";
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = "No speech detected. Please try again.";
          break;
        case 'audio-capture':
          errorMessage = "No microphone found. Please check your microphone.";
          break;
        case 'not-allowed':
          errorMessage = "Microphone access denied. Please allow microphone access.";
          break;
        case 'network':
          errorMessage = "Network error. Please check your internet connection.";
          break;
        default:
          errorMessage = `Voice recognition error: ${event.error}`;
      }

      toast({
        title: "Voice Search Error",
        description: errorMessage,
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isDisabled || isProcessing}
      className={`transition-all duration-200 ${
        isListening 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'hover:bg-secondary/80'
      }`}
      title={isListening ? "Stop listening" : "Voice search"}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isListening ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
      <span className="sr-only">
        {isListening ? "Stop voice search" : "Start voice search"}
      </span>
    </Button>
  );
};