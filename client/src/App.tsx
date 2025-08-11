import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Homepage from "./pages/Homepage";
import { Toaster } from "./components/ui/sonner";
import Chat from "./pages/Chat";
import CodeEditor from "./pages/Editor";
import Meet from "./pages/Meet";
import ProtectedRoute from "./components/protectedroute";
import VideoCall from "./pages/Videocall";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
         <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/call" element={<VideoCall />} />

        <Route element={<ProtectedRoute />}>
         
          <Route path="/editor" element={<CodeEditor />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/meet/:id" element={<Meet />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
