import { useEffect } from 'react';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { useDeepgram } from './hooks/useDeepgram';

function App() {
  // Add this helper function inside App component

// ... inside the Return JSX, add these buttons below the text box ...

  const { 
    connectToDeepgram, 
    disconnectFromDeepgram, 
    sendAudio, 
    transcript, 
    realtimeTranscript,
    connectionState 
  } = useDeepgram();

  // Pass the 'sendAudio' function to the recorder
  // Whenever the recorder has a "chunk", it sends it to Deepgram
  const { startRecording, stopRecording, isRecording } = useAudioRecorder(sendAudio);

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
      disconnectFromDeepgram();
    } else {
      connectToDeepgram();
      // We wait a tiny bit for the socket to open, or handle this better in a real app
      // For this MVP, we start recording immediately; 
      // the useDeepgram 'sendAudio' check handles the "if socket open" check.
      await startRecording();
    }
  };
  
  // Ensure we connect/disconnect properly based on recording state logic if needed
  // (Simplified for this assignment to manual toggle)
const handleCopyText = async () => {
  if (!transcript) return;
  try {
    await navigator.clipboard.writeText(transcript);
    alert('Text copied to clipboard!'); // Or use a nicer toast notification
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};

const handleClear = () => {
  // You'll need to expose a clear function from useDeepgram or just reload for now
  window.location.reload(); 
};
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#1a1a1a] text-gray-100">
      
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Wispr Flow Clone
          </h1>
          <p className="text-gray-400">Push to talk. Real-time transcription.</p>
        </div>

        {/* Text Display Area */}
        <div className="bg-[#2a2a2a] p-6 rounded-xl min-h-[200px] border border-gray-700 shadow-xl overflow-y-auto">
          <p className="whitespace-pre-wrap leading-relaxed">
            {transcript} 
            <span className="text-gray-400 italic">{realtimeTranscript}</span>
          </p>
          
          {transcript === '' && realtimeTranscript === '' && (
             <p className="text-gray-600 italic">Your transcript will appear here...</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleToggleRecording}
            className={`
              relative group rounded-full w-20 h-20 flex items-center justify-center transition-all duration-300
              ${isRecording 
                ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_rgba(37,99,235,0.5)]'}
            `}
          >
            {/* Icon */}
            {isRecording ? (
               <div className="w-8 h-8 bg-white rounded-md" /> // Stop Icon
            ) : (
               <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2" /> // Play Icon
            )}
          </button>
          
          <div className="h-6">
             {connectionState === 'connecting' && <span className="text-yellow-500 text-sm">Connecting...</span>}
             {connectionState === 'connected' && isRecording && <span className="text-red-400 text-sm animate-pulse">● Recording</span>}
             {connectionState === 'error' && <span className="text-red-500 text-sm">Connection Error</span>}
          </div>
        </div>

      </div>
      
<div className="flex gap-4">
  <button 
    onClick={handleCopyText}
    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
  >
    Copy Text
  </button>
  <button 
    onClick={handleClear}
    className="px-4 py-2 bg-gray-700 hover:bg-red-900/50 hover:text-red-200 rounded-lg text-sm font-medium transition-colors"
  >
    Clear
  </button>
</div>
    </div>
  );
}

export default App;