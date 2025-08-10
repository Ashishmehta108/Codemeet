import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export default function HomePage() {
  const [roomId, setRoomId] = useState("");
  const [joinId, setJoinId] = useState("");

  const createRoom = async () => {
    const response = await fetch("http://localhost:3000/room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: roomId }),
    });
    console.log(await response.json());
};

  const joinRoom = async () => {
    const response = await fetch("http://localhost:3000/api/room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: joinId }),
    });
    console.log(await response.json());
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="max-w-2xl  flex  gap-5 items-center justify-between w-full ">
        {/* Create Room */}
        <Card className="shadow-lg hover:shadow-2xl transition-all border border-zinc-700 bg-zinc-800/90 text-white rounded-xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">
              🚀 Create a Room
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter room name"
              className="bg-zinc-800 border-zinc-600 text-white placeholder-zinc-600 focus-visible:ring-0 rounded-lg"
              onChange={(e) => setRoomId(e.target.value)}
            />
            <Button
              onClick={createRoom}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg"
            >
              Create Room
            </Button>
          </CardContent>
        </Card>

        {/* Join Room */}
        <Card className="shadow-lg hover:shadow-2xl transition-all border border-zinc-700 bg-zinc-800/90 text-white rounded-xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">
              🔗 Join a Room
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter room ID"
              className="bg-zinc-800 border-zinc-600 text-white placeholder-zinc-600 focus-visible:ring-0 rounded-lg"
              onChange={(e) => setJoinId(e.target.value)}
            />
            <Button
              onClick={joinRoom}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg"
            >
              Join Room
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
