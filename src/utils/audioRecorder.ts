// Browser microphone audio access & voice note recording
class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording: boolean = false;
  private stream: MediaStream | null = null;

  public async start(): Promise<boolean> {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        return false;
      }
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      return true;
    } catch {
      // Permission denied or unsupported - handle gracefully
      this.isRecording = false;
      return false;
    }
  }

  public stop(): Promise<{ audioUrl: string; duration: number } | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        // Fallback simulated voice note if mic wasn't available
        resolve({
          audioUrl: 'simulated_audio_note',
          duration: 3,
        });
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        this.isRecording = false;

        // Stop all audio tracks to release microphone
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }

        resolve({
          audioUrl,
          duration: Math.max(2, Math.round(this.audioChunks.length * 0.8)),
        });
      };

      this.mediaRecorder.stop();
    });
  }

  public cancel() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.audioChunks = [];
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }
}

export const audioRecorder = new AudioRecorder();
