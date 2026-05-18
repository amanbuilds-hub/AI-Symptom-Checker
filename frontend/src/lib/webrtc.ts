import Peer from 'peerjs';

export class VideoCall {
  private peer: Peer | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  
  constructor(private onRemoteStream?: (stream: MediaStream) => void) {}
  
  async initialize(userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.peer = new Peer(userId, {
        host: 'peerjs-server.herokuapp.com',
        port: 443,
        secure: true,
        path: '/'
      });
      
      this.peer.on('open', (id) => {
        resolve(id);
      });
      
      this.peer.on('error', (error) => {
        reject(error);
      });
      
      this.peer.on('call', async (call) => {
        try {
          const stream = await this.getLocalStream();
          call.answer(stream);
          
          call.on('stream', (remoteStream) => {
            this.remoteStream = remoteStream;
            this.onRemoteStream?.(remoteStream);
          });
        } catch (error) {
          console.error('Error answering call:', error);
        }
      });
    });
  }
  
  async getLocalStream(): Promise<MediaStream> {
    if (!this.localStream) {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });
    }
    return this.localStream;
  }
  
  async makeCall(targetId: string): Promise<void> {
    if (!this.peer) throw new Error('Peer not initialized');
    
    const stream = await this.getLocalStream();
    const call = this.peer.call(targetId, stream);
    
    call.on('stream', (remoteStream) => {
      this.remoteStream = remoteStream;
      this.onRemoteStream?.(remoteStream);
    });
  }
  
  endCall(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
  
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
      }
    }
  }
  
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
      }
    }
  }
}