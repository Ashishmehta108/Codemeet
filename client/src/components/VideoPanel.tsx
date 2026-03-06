import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Mic, MicOff, PhoneOff, User, Video } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface VideoPanelProps {
  roomId?: string;
}

export const VideoPanel: React.FC<VideoPanelProps> = ({ roomId }) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function startMedia() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Failed to get local stream", err);
      }
    }
    startMedia();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioOn(audioTrack.enabled);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-zinc-900/50 border-l border-zinc-800 w-80 h-full">
      <div className="flex items-center gap-2 mb-2">
        <Video className="h-4 w-4 text-zinc-500" />
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Live Call</span>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        {/* Remote Video (Primary) */}
        <div className="relative aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] font-medium text-white border border-white/10">
            Remote Participant
          </div>
          {!remoteVideoRef.current?.srcObject && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700">
              <User className="h-12 w-12 mb-2 opacity-20" />
              <span className="text-[10px] uppercase tracking-tighter opacity-50">Waiting for others...</span>
            </div>
          )}
        </div>

        {/* Local Video (Secondary) */}
        <div className="relative aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={cn("w-full h-full object-cover", !isVideoOn && "opacity-0")}
          />
          {!isVideoOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
              <User className="h-8 w-8 text-zinc-800" />
            </div>
          )}
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] font-medium text-white border border-white/10">
            You
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 py-4 border-t border-zinc-800">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "rounded-full h-10 w-10 border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 transition-all",
            !isAudioOn && "bg-rose-500/20 border-rose-500/50 hover:bg-rose-500/30 text-rose-500"
          )}
          onClick={toggleAudio}
        >
          {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "rounded-full h-10 w-10 border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 transition-all",
            !isVideoOn && "bg-rose-500/20 border-rose-500/50 hover:bg-rose-500/30 text-rose-500"
          )}
          onClick={toggleVideo}
        >
          {isVideoOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="rounded-full h-10 w-10 shadow-lg shadow-rose-500/20"
        >
          <PhoneOff className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
