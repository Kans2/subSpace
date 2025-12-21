import { useState, useRef, useCallback } from 'react';

interface UseAudioRecorderReturn {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  isRecording: boolean;
  mediaStream: MediaStream | null;
}

// Pass a callback function that will receive the audio chunks
export const useAudioRecorder = (onDataAvailable: (data: Blob) => void): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // 1. Request Microphone Permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);

      // 2. Setup MediaRecorder with a supported mimeType
      // Chrome/Tauri (WebView2) usually supports 'audio/webm'
      const mimeType = 'audio/webm';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      // 3. Event Listener: When audio data is available (every X ms)
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          onDataAvailable(event.data);
        }
      };

      // 4. Start recording with a 250ms timeslice (sends data 4 times a second)
      mediaRecorder.start(250); 
      setIsRecording(true);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  }, [onDataAvailable]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Stop all tracks to release the microphone
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      setMediaStream(null);
    }
  }, [isRecording]);

  return { startRecording, stopRecording, isRecording, mediaStream };
};