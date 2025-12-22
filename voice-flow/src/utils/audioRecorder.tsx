export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;

  private getSupportedMimeType(): string {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg",
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log(`Using supported MIME type: ${type}`);
        return type;
      }
    }
    console.warn("No specific MIME type supported, letting browser decide.");
    return ""; // Empty string lets browser use default
  }

  async start(onDataAvailable: (data: Blob) => void): Promise<void> {
    try {
      console.log("AudioRecorder: Requesting Mic...");
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mimeType = this.getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;

      this.mediaRecorder = new MediaRecorder(this.stream, options);

      this.mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          // console.log("AudioRecorder: Chunk captured", event.data.size); // Uncomment to debug heavy flow
          onDataAvailable(event.data);
        }
      });

      this.mediaRecorder.start(250); // Slice every 250ms
      console.log("AudioRecorder: Started");
    } catch (error) {
      console.error("AudioRecorder Error:", error);
      throw error;
    }
  }

  stop(): void {
    console.log("AudioRecorder: Stopping...");
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }
}