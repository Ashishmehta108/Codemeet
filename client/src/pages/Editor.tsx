import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Editor, { type OnChange, type OnMount } from "@monaco-editor/react";
import dracula from "../themes/dracula.json";
import { Button } from "../components/ui/button";
import { Select } from "../components/ui/select";
import { ScrollArea } from "../components/ui/scroll-area";
import { Play, Loader2, Terminal as TerminalIcon, Copy, Check, Share2, PanelLeft, PanelRight, Command, Layout } from "lucide-react";
import { Language, ExecutionResponse } from "../../../shared/src/types/code";
import { toast } from "sonner";
import { FileExplorer, FileNode } from "../components/FileExplorer";
import { VideoPanel } from "../components/VideoPanel";
import { cn } from "../lib/utils";
import { io, Socket } from "socket.io-client";

const DEFAULT_CODE: Record<Language, string> = {
  typescript: `// Write your TypeScript code here\nfunction greet(name: string): string {\n  return 'Hello, ' + name + '!';\n}\n\nconsole.log(greet('World'));`,
  javascript: `// Write your JavaScript code here\nfunction greet(name) {\n  return 'Hello, ' + name + '!';\n}\n\nconsole.log(greet('World'));`,
  python: `# Write your Python code here\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))`,
  go: `// Write your Go code here\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}`,
  java: `// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
  cpp: `// Write your C++ code here\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}`,
  rust: `// Write your Rust code here\nfn main() {\n    println!("Hello, World!");\n}`,
  html: `<!-- Write your HTML code here -->\n<!DOCTYPE html>\n<html>\n<body>\n    <h1>Hello World</h1>\n</body>\n</html>`,
  css: `/* Write your CSS code here */\nbody {\n    background-color: #f0f0f0;\n}`,
};

const INITIAL_FILES: FileNode[] = [
  {
    id: 'root',
    name: 'src',
    type: 'folder',
    children: [
      { id: '1', name: 'main.ts', type: 'file', content: DEFAULT_CODE.typescript },
    ]
  },
];

export default function CodeEditor() {
  const { id: roomId } = useParams<{ id: string }>();
  const [language, setLanguage] = useState<Language>("typescript");
  const [code, setCode] = useState<string>(DEFAULT_CODE.typescript);
  const [output, setOutput] = useState<ExecutionResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState("dracula");
  const [copied, setCopied] = useState(false);

  const [files, setFiles] = useState<FileNode[]>(INITIAL_FILES);
  const [selectedFileId, setSelectedFileId] = useState<string>('1');
  const [showExplorer, setShowExplorer] = useState(true);
  const [showVideo, setShowVideo] = useState(true);

  const editorRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomId) return;
    socketRef.current = io("http://localhost:3000", { withCredentials: true });
    const socket = socketRef.current;

    socket.on('connect', () => {
      socket.emit('join-room', { roomId });
    });

    socket.on('fileUpdated', (payload: { file: string, fileName: string, sender: string }) => {
      if (payload.sender !== socket.id) {
        setCode(payload.file);
        updateFileInState(selectedFileId, payload.file);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const updateFileInState = (id: string, newContent: string) => {
    setFiles(prev => {
      const updateNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.id === id) return { ...node, content: newContent };
          if (node.children) return { ...node, children: updateNode(node.children) };
          return node;
        });
      };
      return updateNode(prev);
    });
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monaco.editor.defineTheme("dracula", {
      base: "vs-dark",
      inherit: true,
      rules: dracula.rules as any,
      colors: dracula.colors as any,
    });
    monaco.editor.setTheme(theme);
  };

  const handleEditorChange: OnChange = (value) => {
    if (value !== undefined) {
      setCode(value);
      updateFileInState(selectedFileId, value);

      // Emit sync event
      if (socketRef.current && roomId) {
        socketRef.current.emit("updateFile", {
          roomId,
          file: value,
          fileName: "main.ts" // For simplicity, sync active file
        });
      }
    }
  };

  const onFileSelect = (file: FileNode) => {
    setSelectedFileId(file.id);
    if (file.content !== undefined) {
      setCode(file.content);
      // Infer language logic...
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const response = await fetch("http://localhost:3000/code/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });
      const result = await response.json();
      setOutput(result);
    } catch (error) {
      setOutput({
        stdout: "",
        stderr: "Execution error: Ensure Docker is running and healthy.",
        exitCode: 1,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-400 overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-zinc-900 bg-zinc-950 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Command className="h-4 w-4 text-zinc-500" />
            <span className="text-sm font-bold text-zinc-200 uppercase tracking-tighter">devsync</span>
          </div>

          <div className="flex items-center bg-zinc-900/50 rounded-lg p-0.5 border border-zinc-800">
            <button className={cn("h-7 px-2 rounded-md transition-all", showExplorer ? "bg-zinc-800 text-zinc-100" : "text-zinc-600")} onClick={() => setShowExplorer(!showExplorer)}>
              <PanelLeft className="h-3.5 w-3.5" />
            </button>
            <button className={cn("h-7 px-2 rounded-md transition-all", showVideo ? "bg-zinc-800 text-zinc-100" : "text-zinc-600")} onClick={() => setShowVideo(!showVideo)}>
              <PanelRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <Select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="w-28 bg-transparent border-none text-zinc-500 h-8 text-[11px] font-bold uppercase tracking-wider">
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="go">Go</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="rust">Rust</option>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={runCode} disabled={isRunning} className="bg-zinc-100 hover:bg-white text-zinc-950 h-8 px-5 text-[11px] font-bold uppercase tracking-widest rounded-md">
            {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3 w-3 fill-current" />}
            Run
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {showExplorer && <FileExplorer files={files} onFileSelect={onFileSelect} selectedFileId={selectedFileId} onCreateFile={() => {}} onCreateFolder={() => {}} onDelete={() => {}} />}
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              theme={theme}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                wordWrap: "on",
                padding: { top: 20 },
                backgroundColor: "#09090b",
              }}
            />
          </div>
          <div className="h-1/4 border-t border-zinc-900 bg-zinc-950 flex flex-col">
            <div className="px-6 py-2 border-b border-zinc-900/50 flex items-center gap-3">
              <TerminalIcon className="h-3.5 w-3.5 text-zinc-700" />
              <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Output</span>
            </div>
            <ScrollArea className="flex-1 p-6 font-mono text-[11px]">
              {isRunning ? <div className="text-zinc-500 italic">Running...</div> : output ? <div>{output.stdout || output.stderr}</div> : <div className="text-zinc-800 italic">Idle.</div>}
            </ScrollArea>
          </div>
        </div>
        {showVideo && <VideoPanel roomId={roomId} />}
      </div>
    </div>
  );
}
