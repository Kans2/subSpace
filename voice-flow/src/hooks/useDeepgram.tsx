import { useState, useRef, useCallback, useEffect } from 'react';

const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

interface UseDeepgramReturn {
  connectToDeepgram: () => void;
  disconnectFromDeepgram: () => void;
  sendAudio: (audioData: Blob) => void;
  transcript: string;
  realtimeTranscript: string; // Shows the current sentence being formed
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
}

export const useDeepgram = (): UseDeepgramReturn => {
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [transcript, setTranscript] = useState('');
  const [realtimeTranscript, setRealtimeTranscript] = useState('');
  const socketRef = useRef<WebSocket | null>(null);

  const connectToDeepgram = useCallback(() => {
    if (!DEEPGRAM_API_KEY) {
      console.error("Deepgram API Key is missing!");
      return;
    }

    setConnectionState('connecting');

    // Setup Deepgram WebSocket URL
    // punctuate=true: adds periods and commas
    // smart_format=true: formats dates, times, currencies
    // model=nova-2: Deepgram's fastest and most accurate model
    const url = 'wss://api.deepgram.com/v1/listen?punctuate=true&smart_format=true&model=nova-2';
    
    const socket = new WebSocket(url, ['token', DEEPGRAM_API_KEY]);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('Deepgram WebSocket Connected');
      setConnectionState('connected');
    };

    socket.onmessage = (message) => {
      const received = JSON.parse(message.data);
      
      const transcriptData = received.channel?.alternatives[0]?.transcript;
      
      if (transcriptData && received.is_final) {
        // "is_final": The sentence is complete. Append it to the main block.
        setTranscript((prev) => prev + " " + transcriptData);
        setRealtimeTranscript(''); // Clear the temp buffer
      } else if (transcriptData) {
        // Not final yet, just update the realtime view
        setRealtimeTranscript(transcriptData);
      }
    };

    socket.onclose = () => {
      console.log('Deepgram WebSocket Closed');
      setConnectionState('disconnected');
    };

    socket.onerror = (error) => {
      console.error('Deepgram WebSocket Error', error);
      setConnectionState('error');
    };

  }, []);

  const disconnectFromDeepgram = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      // Send a close frame to tell Deepgram we are done
      socketRef.current.send(JSON.stringify({ type: 'CloseStream' }));
      socketRef.current.close();
    }
  }, []);

  const sendAudio = useCallback((audioData: Blob) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(audioData);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectFromDeepgram();
    };
  }, [disconnectFromDeepgram]);

  return { 
    connectToDeepgram, 
    disconnectFromDeepgram, 
    sendAudio, 
    transcript,
    realtimeTranscript,
    connectionState 
  };
};