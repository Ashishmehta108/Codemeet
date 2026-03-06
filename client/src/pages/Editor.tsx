import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Editor, { type OnChange, type OnMount } from "@monaco-editor/react";
import { editor as monacoEditor } from "monaco-editor";
import dracula from "../themes/dracula.json";
import { Button } from "../components/ui/button";
import { Select } from "../components/ui/select";
import { ScrollArea } from "../components/ui/scroll-area";
import { Play, Loader2, Terminal as TerminalIcon, Copy, Check, Share2, PanelLeft, PanelRight, Command } from "lucide-react";
import { Language, ExecutionResponse } from "../../../shared/src/types/code";
import { toast } from "sonner";
import { FileExplorer, FileNode } from "../components/FileExplorer";
import { VideoPanel } from "../components/VideoPanel";
import { cn } from "../lib/utils";

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
      { id: '2', name: 'utils.ts', type: 'file', content: '// Utility functions' },
    ]
  },
  { id: '3', name: 'package.json', type: 'file', content: '{\n  "name": "project"\n}' },
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
      // Update file content in our state
      setFiles(prev => {
        const updateNode = (nodes: FileNode[]): FileNode[] => {
          return nodes.map(node => {
            if (node.id === selectedFileId) return { ...node, content: value };
            if (node.children) return { ...node, children: updateNode(node.children) };
            return node;
          });
        };
        return updateNode(prev);
      });
    }
  };

  const onFileSelect = (file: FileNode) => {
    setSelectedFileId(file.id);
    if (file.content !== undefined) {
      setCode(file.content);
      // Infer language from extension
      if (file.name.endsWith('.ts')) setLanguage('typescript');
      else if (file.name.endsWith('.js')) setLanguage('javascript');
      else if (file.name.endsWith('.py')) setLanguage('python');
      else if (file.name.endsWith('.go')) setLanguage('go');
      else if (file.name.endsWith('.java')) setLanguage('java');
      else if (file.name.endsWith('.cpp')) setLanguage('cpp');
      else if (file.name.endsWith('.rs')) setLanguage('rust');
      else if (file.name.endsWith('.html')) setLanguage('html');
      else if (file.name.endsWith('.css')) setLanguage('css');
    }
  };

  const createFile = (parentId: string | null) => {
    const name = prompt("Enter file name:");
    if (!name) return;
    const newFile: FileNode = { id: Date.now().toString(), name, type: 'file', content: '' };
    setFiles(prev => {
      if (!parentId) return [...prev, newFile];
      const addToParent = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.id === parentId) return { ...node, children: [...(node.children || []), newFile] };
          if (node.children) return { ...node, children: addToParent(node.children) };
          return node;
        });
      };
      return addToParent(prev);
    });
  };

  const createFolder = (parentId: string | null) => {
    const name = prompt("Enter folder name:");
    if (!name) return;
    const newFolder: FileNode = { id: Date.now().toString(), name, type: 'folder', children: [] };
    setFiles(prev => {
      if (!parentId) return [...prev, newFolder];
      const addToParent = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.id === parentId) return { ...node, children: [...(node.children || []), newFolder] };
          if (node.children) return { ...node, children: addToParent(node.children) };
          return node;
        });
      };
      return addToParent(prev);
    });
  };

  const deleteNode = (id: string) => {
    const removeNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.filter(node => node.id !== id).map(node => ({
        ...node,
        children: node.children ? removeNode(node.children) : undefined
      }));
    };
    setFiles(prev => removeNode(prev));
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
        stderr: "Failed to connect to the execution server.",
        exitCode: 1,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      toast.success("Room ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Subtle Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/40 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-2">
            <div className="p-1.5 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
              <Command className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">DevSync</h1>
          </div>

          <div className="flex items-center bg-zinc-800/50 rounded-lg p-0.5 border border-zinc-700/50">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 px-2 rounded-md text-zinc-400", showExplorer && "bg-zinc-700 text-white")}
              onClick={() => setShowExplorer(!showExplorer)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 px-2 rounded-md text-zinc-400", showVideo && "bg-zinc-700 text-white")}
              onClick={() => setShowVideo(!showVideo)}
            >
              <PanelRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-4 w-[1px] bg-zinc-800" />

          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-32 bg-transparent border-none text-zinc-300 h-8 text-xs focus:ring-0 hover:bg-zinc-800/50 rounded-md transition-colors"
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="go">Go</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="rust">Rust</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </Select>

          {roomId && (
            <div
              className="flex items-center gap-2 px-2 py-1 bg-zinc-800/30 rounded border border-zinc-800/50 hover:border-zinc-700 transition-colors cursor-pointer group"
              onClick={copyRoomId}
            >
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Room:</span>
              <span className="text-[10px] font-mono text-blue-400/80 group-hover:text-blue-400 transition-colors">{roomId}</span>
              {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-zinc-600 group-hover:text-zinc-400" />}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
           <Button
             variant="ghost"
             size="sm"
             className="text-zinc-400 hover:text-white gap-2 h-8 text-xs font-medium"
           >
             <Share2 className="h-3.5 w-3.5" />
             Invite
           </Button>
          <Button
            onClick={runCode}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-8 px-4 text-xs font-bold shadow-lg shadow-blue-500/10 transition-all active:scale-95"
          >
            {isRunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            Run
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Explorer */}
        {showExplorer && (
          <FileExplorer
            files={files}
            onFileSelect={onFileSelect}
            selectedFileId={selectedFileId}
            onCreateFile={createFile}
            onCreateFolder={createFolder}
            onDelete={deleteNode}
          />
        )}

        {/* Editor & Terminal Area */}
        <div className="flex-1 flex flex-col relative min-w-0">
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language === "typescript" ? "typescript" : language === "javascript" ? "javascript" : language}
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              theme={theme}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                wordWrap: "on",
                tabSize: 2,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 20 },
                lineNumbersMinChars: 3,
                renderLineHighlight: "all",
                backgroundColor: "#09090b",
              }}
            />
          </div>

          {/* Docked Terminal (Subtle) */}
          <div className="h-1/3 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/50 bg-zinc-900/20">
              <div className="flex items-center gap-2">
                <TerminalIcon className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Console Output</span>
              </div>
              {output && (
                <button
                  className="text-[10px] text-zinc-600 hover:text-zinc-400 font-medium uppercase transition-colors"
                  onClick={() => setOutput(null)}
                >
                  Clear
                </button>
              )}
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 font-mono text-xs">
                {isRunning ? (
                  <div className="flex items-center gap-2 text-blue-400/60 py-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Executing program...</span>
                  </div>
                ) : output ? (
                  <div className="space-y-3">
                    {output.stdout && (
                      <div className="whitespace-pre-wrap text-emerald-400/90 leading-relaxed">
                        {output.stdout}
                      </div>
                    )}
                    {output.stderr && (
                      <div className="whitespace-pre-wrap text-rose-400 bg-rose-500/5 p-3 rounded border border-rose-500/10 leading-relaxed">
                        {output.stderr}
                      </div>
                    )}
                    {!output.stdout && !output.stderr && (
                      <div className="text-zinc-600 italic">No output returned.</div>
                    )}
                    <div className="pt-3 flex gap-4 text-[10px] text-zinc-600 border-t border-zinc-900">
                      <span>EXIT_CODE: <span className={output.exitCode === 0 ? "text-emerald-600" : "text-rose-600"}>{output.exitCode}</span></span>
                      {output.time !== undefined && <span>ELAPSED: <span className="text-zinc-500">{output.time}ms</span></span>}
                    </div>
                  </div>
                ) : (
                  <div className="text-zinc-700 italic">Console is empty. Run code to see logs here.</div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Sidebar: Video Call */}
        {showVideo && <VideoPanel roomId={roomId} />}
      </div>
    </div>
  );
}
