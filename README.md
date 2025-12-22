# Voice-to-Text Desktop App (Wispr Flow Clone)

A cross-platform desktop application built with **Tauri** and **React**, utilizing **Deepgram** for real-time speech-to-text transcription. This project demonstrates a "Push-to-Talk" workflow similar to Wispr Flow.

## 🛠 Tech Stack

* **Core:** Tauri (Rust + WebView) - Chosen for native performance and small bundle size compared to Electron.
* **Frontend:** React + TypeScript - Provides a robust, type-safe UI environment.
* **Styling:** CSS Modules / Standard CSS - Simple, maintainable styling without heavy framework overhead.
* **AI/ML Service:** Deepgram SDK - Selected for low-latency streaming transcription.

## 🚀 Features

1.  **Push-to-Talk:** Intuitive hold-to-record mechanism prevents accidental recording.
2.  **Real-Time Streaming:** Audio is streamed in chunks (250ms) to Deepgram for immediate feedback.
3.  **Clipboard Integration:** One-click "Copy" functionality allows easy transfer of text to other applications.
4.  **Error Handling:** Visual feedback for permission denials or API connection failures.
5.  **Microphone Safety:** Ensures all audio tracks are stopped immediately upon button release.

## 🏗 Architecture & Design Decisions

### 1. Separation of Concerns (Custom Hook)
I implemented the core logic in a custom hook `useVoiceToText`.
* **Why?** This keeps the `App.tsx` component purely focused on the UI (presentation layer).
* **Benefit:** The audio capture logic and WebSocket management are isolated, making the code easier to test and debug.

### 2. Frontend-Based Audio Processing
The application uses the browser's native `MediaRecorder` API within the WebView instead of Rust-based audio capture (`cpal`).
* **Decision:** Since Tauri exposes standard Web APIs, using `MediaRecorder` reduced development complexity significantly while meeting the requirement for "High-quality audio capture."
* **Trade-off:** Native Rust capture might offer slightly lower latency in extreme cases, but the Web API is sufficient for a functional clone.

### 3. State Management
I used React's local state (`useState`) rather than a global store like Redux.
* **Reasoning:** The application scope is small (single view). Adding Redux would introduce unnecessary boilerplate ("over-engineering") for simple string and boolean states.

## 🏃‍♂️ How to Run

1.  **Prerequisites:** Ensure Rust and Node.js are installed.
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Setup:**
    Create a `.env` file in the root directory:
    ```env
    VITE_DEEPGRAM_API_KEY=your_deepgram_api_key
    ```
4.  **Run Development Mode:**
    ```bash
    npm run tauri dev
    ```

## 📝 Known Limitations / Future Improvements

* **Global Injection:** Currently, the app uses the Clipboard to transfer text. A full product version would likely use Rust-based keyboard event injection to type directly into other active windows.
* **Silence Detection:** The app currently relies entirely on the Push-to-Talk release to stop recording.