import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function Videocall() {
  const socketRef = useRef(
    io(`${import.meta.env.BACKEND_URL}`, { withCredentials: true })
  );
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [remoteId, setRemoteId] = useState<string>("");
  const [socketId, setSocketId] = useState<string>("");
  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices", err);
      }
    })();
  }, []);

  const createPeerConnection = () => {
    const peer = new RTCPeerConnection(configuration);
    localStreamRef.current?.getTracks().forEach((track) => {
      peer.addTrack(track, localStreamRef.current!);
    });
    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate && remoteId) {
        socketRef.current.emit("candidate", {
          target: remoteId,
          candidate: event.candidate,
        });
      }
    };

    return peer;
  };

  useEffect(() => {
    const socket = socketRef.current;

    socket.on("connect", () => {
      setSocketId(socket.id!);
    });

    socket.on("call", async ({ sender, offer }) => {
      setRemoteId(sender);
      peerRef.current = createPeerConnection();

      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);

      socket.emit("answer", { target: sender, answer });
    });

    socket.on("answer", async ({ answer }) => {
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    });
    socket.on("candidate", async ({ candidate }) => {
      if (peerRef.current) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding received ICE candidate", err);
        }
      }
    });

    return () => {
      socket.off("connect");
      socket.off("call");
      socket.off("answer");
      socket.off("candidate");
    };
  }, [remoteId]);

  useEffect(() => {
    if (!socketId) return;
    (async () => {
      try {
        await fetch(`${import.meta.env.BACKEND_URL}/user/socket`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(socketId),
        });
      } catch (err) {
        console.error("Error updating socketId", err);
      }
    })();
  }, [socketId]);

  const startCall = async (targetEmail: string) => {
    console.log("hi");
    peerRef.current = createPeerConnection();
    const offer = await peerRef.current.createOffer();
    console.log(offer);
    await peerRef.current.setLocalDescription(offer);

    socketRef.current.emit("call", {
      target: targetEmail,
      offer,
      sender: socketRef.current.id,
    });
  };

  return (
    <div>
      <div>
        <h3>Local Video</h3>
        <video id="localVideo" ref={localVideoRef} autoPlay playsInline />
      </div>
      <div>
        <h3>Remote Video</h3>
        <video id="remoteVideo" ref={remoteVideoRef} autoPlay playsInline />
      </div>
      <button onClick={() => startCall("testing@gmail.com")}>Call</button>
    </div>
  );
}
