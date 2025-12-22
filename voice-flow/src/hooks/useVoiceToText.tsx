import { useState, useRef, useEffect, useCallback } from "react";

import { createClient, LiveClient, LiveTranscriptionEvents } from "@deepgram/sdk";

const API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

export const useVoiceToText = () => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Ready");
  // 1. Add Error State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deepgramLive = useRef<LiveClient | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const deepgram = createClient(API_KEY);

  useEffect(() => {
    // Cleanup on unmount to prevent memory leaks
    return () => {
      stopRecording();
    };
  }, []);

  const startRecording = useCallback(async () => {
    // 2. Reset error state on start
    setErrorMessage(null);

    try {
      setStatus("Requesting Microphone...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      setStatus("Connecting to Deepgram...");
      if (!deepgramLive.current) {
        deepgramLive.current = deepgram.listen.live({
            model: "nova-2",
            language: "en-US",
            smart_format: true,
        });

        // Event Listeners
        deepgramLive.current.on(LiveTranscriptionEvents.Open, () => {
          setStatus("Connected");
          
          mediaRecorder.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
          
          mediaRecorder.current.addEventListener("dataavailable", (event) => {
            if (event.data.size > 0 && deepgramLive.current) {
              deepgramLive.current.send(event.data);
            }
          });

          mediaRecorder.current.start(250); // Send audio slices every 250ms
          setIsListening(true);
        });

        deepgramLive.current.on(LiveTranscriptionEvents.Transcript, (data) => {
          const newText = data.channel.alternatives[0].transcript;
          if (newText) {
            setTranscript((prev) => (prev ? prev + " " + newText : newText));
          }
        });

        deepgramLive.current.on(LiveTranscriptionEvents.Close, () => {
          setStatus("Ready");
        });

        // 3. Handle Deepgram Errors
        deepgramLive.current.on(LiveTranscriptionEvents.Error, (err) => {
          console.error(err);
          setErrorMessage("Connection Error: Please check your API Key.");
          setStatus("Error");
        });
      }
    } catch (error: any) {
      console.error("Microphone access denied:", error);
      // 4. Handle Microphone/System Errors
      setErrorMessage( "Microphone access denied. Please allow permissions.");
      setStatus("Microphone Error");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      // Important: Stop all audio tracks to turn off the hardware mic light
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }

    if (deepgramLive.current) {
      deepgramLive.current.finish();
      deepgramLive.current = null;
    }

    setIsListening(false);
    setStatus("Ready");
  }, []);

  const clearTranscript = () => setTranscript("");

  return {
    transcript,
    isListening,
    status,
    errorMessage, // 5. Export this so App.tsx can use it
    startRecording,
    stopRecording,
    clearTranscript,
    setTranscript 
  };
};




