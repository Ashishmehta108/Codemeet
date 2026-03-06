import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Code2, Users, Rocket, ExternalLink } from "lucide-react";

export default function HomePage() {
  const [roomId, setRoomId] = useState("");
  const [joinId, setJoinId] = useState("");
  const navigate = useNavigate();

  const createRoom = async () => {
    if (!roomId) return;
    try {
      const response = await fetch("http://localhost:3000/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomId }),
      });
      const data = await response.json();
      if (data.id) {
         navigate(`/editor/${data.id}`);
      }
    } catch (error) {
      console.error("Failed to create room", error);
      // Fallback if the room API fails
      navigate(`/editor/${Math.random().toString(36).substring(7)}`);
    }
  };

  const joinRoom = async () => {
    if (!joinId) return;
    navigate(`/editor/${joinId}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black">
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <Code2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Dev<span className="text-blue-500">Sync</span>
          </h1>
        </div>
        <p className="text-zinc-400 text-lg max-w-md">
          Collaborative real-time coding environment with instant code execution and integrated video calls.
        </p>
      </div>

      <div className="max-w-4xl grid md:grid-cols-2 gap-8 w-full ">
        {/* Create Room */}
        <Card className="group shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border-zinc-800 bg-zinc-900/50 backdrop-blur-xl text-white rounded-2xl overflow-hidden">
          <div className="h-2 bg-blue-600 w-full" />
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Rocket className="h-6 w-6 text-blue-500" />
              Create Space
            </CardTitle>
            <CardDescription className="text-zinc-500">
              Start a new session and invite others to collaborate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Input
                placeholder="Session Name (e.g. Frontend Sync)"
                className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus-visible:ring-blue-500 rounded-xl h-12"
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>
            <Button
              onClick={createRoom}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Start Session
              <ExternalLink className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Join Room */}
        <Card className="group shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 border-zinc-800 bg-zinc-900/50 backdrop-blur-xl text-white rounded-2xl overflow-hidden">
          <div className="h-2 bg-emerald-600 w-full" />
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-emerald-500" />
              Join Space
            </CardTitle>
            <CardDescription className="text-zinc-500">
              Enter a session ID to join an existing collaboration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Input
                placeholder="Enter Session ID"
                className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus-visible:ring-emerald-500 rounded-xl h-12"
                onChange={(e) => setJoinId(e.target.value)}
              />
            </div>
            <Button
              onClick={joinRoom}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Join Session
              <ExternalLink className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 flex gap-8 text-zinc-600 font-medium animate-pulse">
        <span className="flex items-center gap-2 italic">10+ Languages Supported</span>
        <span className="flex items-center gap-2 italic">Real-time Execution</span>
      </div>
    </div>
  );
}
