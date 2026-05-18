import React, { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import Button from '../ui/Button';
import { VideoCall as VideoCallService } from '../../lib/webrtc';

interface VideoCallProps {
  doctorId: string;
  doctorName: string;
  onEndCall: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({
  doctorId,
  doctorName,
  onEndCall
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [videoCall] = useState(() => new VideoCallService());
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');

  useEffect(() => {
    const initCall = async () => {
      try {
        // Initialize peer connection
        const userId = `patient-${Date.now()}`;
        await videoCall.initialize(userId);
        
        // Get local stream
        const stream = await videoCall.getLocalStream();
        setLocalStream(stream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Set up remote stream handler
        videoCall['onRemoteStream'] = (remoteStream: MediaStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          setIsConnected(true);
          setCallStatus('connected');
        };
        
        // Simulate connecting to doctor (in real app, this would be via signaling server)
        setTimeout(() => {
          setCallStatus('connected');
        }, 2000);
        
      } catch (error) {
        console.error('Failed to initialize video call:', error);
        setCallStatus('ended');
      }
    };

    initCall();

    return () => {
      videoCall.endCall();
    };
  }, [videoCall]);

  const handleEndCall = () => {
    videoCall.endCall();
    setCallStatus('ended');
    onEndCall();
  };

  const toggleVideo = () => {
    videoCall.toggleVideo(!isVideoEnabled);
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = () => {
    videoCall.toggleAudio(!isAudioEnabled);
    setIsAudioEnabled(!isAudioEnabled);
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="relative h-96 bg-black">
        {/* Remote video (doctor) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Local video (patient) */}
        <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Call status overlay */}
        {callStatus !== 'connected' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg">
                {callStatus === 'connecting' ? `Connecting to Dr. ${doctorName}...` : 'Call ended'}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Call controls */}
      <div className="p-4 bg-gray-800 flex justify-center space-x-4">
        <Button
          variant={isVideoEnabled ? 'secondary' : 'danger'}
          size="sm"
          onClick={toggleVideo}
          className="rounded-full w-12 h-12 p-0"
        >
          {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </Button>
        
        <Button
          variant={isAudioEnabled ? 'secondary' : 'danger'}
          size="sm"
          onClick={toggleAudio}
          className="rounded-full w-12 h-12 p-0"
        >
          {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </Button>
        
        <Button
          variant="danger"
          size="sm"
          onClick={handleEndCall}
          className="rounded-full w-12 h-12 p-0"
        >
          <PhoneOff size={20} />
        </Button>
      </div>
      
      {/* Call info */}
      <div className="p-4 bg-gray-50 text-center">
        <p className="text-sm text-gray-600">
          {callStatus === 'connected' 
            ? `Connected with Dr. ${doctorName}` 
            : callStatus === 'connecting' 
            ? 'Establishing connection...' 
            : 'Call ended'}
        </p>
      </div>
    </div>
  );
};

export default VideoCall;