import { useState } from "react";
import "./App.css";
import { useVoiceToText } from "./hooks/useVoiceToText";

function App() {
  const {
    transcript,
    isListening,
    status,
    errorMessage,
    startRecording,
    stopRecording,
    setTranscript,
  } = useVoiceToText();

  // Simple feedback state for the Copy button
  const [copyFeedback, setCopyFeedback] = useState("");

  const handleCopy = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopyFeedback("Copied!");
      setTimeout(() => setCopyFeedback(""), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTranscript((prev) => prev + " " + text);
    } catch (err) {
      console.error("Failed to paste", err);
      alert("Please allow clipboard permissions to paste.");
    }
  };

  return (
    <div className="container">
      <h1>Wispr Flow Clone</h1>

      {/* Error Banner */}
      {errorMessage && <div className="error-banner">{errorMessage}</div>}

      <div className={`status-indicator ${isListening ? "listening" : ""}`}>
        {isListening ? "● Listening..." : status}
      </div>

      <div className="editor-wrapper">
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Hold the button and speak..."
        />
        
        {/* Toolbar inside/below the editor */}
        <div className="toolbar">
          <button className="tool-btn" onClick={handleCopy}>
            {copyFeedback || "📋 Copy"}
          </button>
          <button className="tool-btn" onClick={handlePaste}>
            📝 Paste
          </button>
          <button className="tool-btn clear-btn" onClick={() => setTranscript("")}>
            ❌ Clear
          </button>
        </div>
      </div>

      <button
        className={`mic-button ${isListening ? "recording" : ""}`}
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onMouseLeave={stopRecording}
      >
        {isListening ? "Release to Stop" : "Hold to Speak"}
      </button>

      <div className="footer">
        <p>Powered by Tauri & Deepgram</p>
      </div>
    </div>
  );
}

export default App;

// import "./App.css";
// import { useVoiceToText } from "./hooks/useVoiceToText";

// function App() {
//   const { 
//     transcript, 
//     isListening, 
//     status, 
//     startRecording, 
//     stopRecording, 
//     setTranscript 
//   } = useVoiceToText();

//   return (
//     <div className="container">
//       <h1>Wispr Flow Clone</h1>
      
//       {/* Status Bar */}
//       <div className={`status-indicator ${isListening ? "listening" : ""}`}>
//         {isListening ? "● Listening..." : status}
//       </div>

//       {/* Text Output */}
//       <textarea
//         value={transcript}
//         onChange={(e) => setTranscript(e.target.value)}
//         placeholder="Hold the button and speak..."
//       />

//       {/* Push-to-Talk Button */}
//       <button
//         className={isListening ? "recording" : ""}
//         onMouseDown={startRecording}
//         onMouseUp={stopRecording}
//         onMouseLeave={stopRecording} // Handles dragging cursor off button
//       >
//         {isListening ? "Release to Stop" : "Hold to Speak"}
//       </button>

//       <div className="footer">
//         <p>Powered by Tauri & Deepgram</p>
//       </div>
//     </div>
//   );
// }

// export default App;