import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Editor, { type OnChange, type OnMount } from "@monaco-editor/react";
import { editor as monacoEditor } from "monaco-editor";
import dracula from "../themes/dracula.json";
import { Button } from "../components/ui/button";
import { Select } from "../components/ui/select";
import { ScrollArea } from "../components/ui/scroll-area";
import { Play, Loader2, Terminal as TerminalIcon, Copy, Check, Share2 } from "lucide-react";
import { Language, ExecutionResponse } from "../../../shared/src/types/code";
import { toast } from "sonner";

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

export default function CodeEditor() {
  const { id: roomId } = useParams<{ id: string }>();
  const [language, setLanguage] = useState<Language>("typescript");
  const [code, setCode] = useState<string>(DEFAULT_CODE.typescript);
  const [output, setOutput] = useState<ExecutionResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState("dracula");
  const [copied, setCopied] = useState(false);

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
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as Language;
    setLanguage(newLang);
    setCode(DEFAULT_CODE[newLang]);
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
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <TerminalIcon className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">DevSync</h1>
          </div>

          <div className="h-6 w-[1px] bg-zinc-800" />

          <Select
            value={language}
            onChange={handleLanguageChange}
            className="w-40 bg-zinc-800/50 border-zinc-700 text-zinc-100 h-9 rounded-lg focus:ring-blue-500"
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
            <div className="flex items-center gap-2 bg-zinc-800/30 px-3 py-1.5 rounded-lg border border-zinc-800">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Room ID:</span>
              <span className="text-xs font-mono text-blue-400">{roomId}</span>
              <button onClick={copyRoomId} className="hover:text-white transition-colors">
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-zinc-500" />}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
           <Button
             variant="outline"
             className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 gap-2 h-9"
           >
             <Share2 className="h-4 w-4" />
             Invite
           </Button>
          <Button
            onClick={runCode}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-9 px-5 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
            Run
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 relative border-r border-zinc-800">
          <Editor
            height="100%"
            language={language === "typescript" ? "typescript" : language === "javascript" ? "javascript" : language}
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme={theme}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: true },
              wordWrap: "on",
              tabSize: 2,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 20 },
              cursorSmoothCaretAnimation: "on",
              smoothScrolling: true,
              lineNumbersMinChars: 3,
            }}
          />
        </div>

        {/* Output Area */}
        <div className="w-[400px] flex flex-col bg-zinc-950">
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/30">
            <div className="flex items-center gap-2">
              <TerminalIcon className="h-4 w-4 text-zinc-500" />
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Output</span>
            </div>
            {output && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] text-zinc-500 hover:text-zinc-300"
                onClick={() => setOutput(null)}
              >
                Clear
              </Button>
            )}
          </div>
          <ScrollArea className="flex-1 p-0 font-mono text-sm">
            <div className="p-4">
              {isRunning ? (
                <div className="flex items-center gap-3 text-blue-500/70 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs animate-pulse">Compiling and executing...</span>
                </div>
              ) : output ? (
                <div className="space-y-4">
                  {output.stdout && (
                    <div className="whitespace-pre-wrap text-emerald-400 leading-relaxed">
                      {output.stdout}
                    </div>
                  )}
                  {output.stderr && (
                    <div className="whitespace-pre-wrap text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 leading-relaxed">
                      {output.stderr}
                    </div>
                  )}
                  {!output.stdout && !output.stderr && (
                    <div className="text-zinc-600 italic text-xs">Program executed with no output.</div>
                  )}

                  <div className="mt-6 pt-4 border-t border-zinc-900 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[10px] text-zinc-600 uppercase tracking-tighter">
                      <span>Status</span>
                      <span className={output.exitCode === 0 ? "text-emerald-500" : "text-rose-500"}>
                        {output.exitCode === 0 ? "Success" : `Failed (Exit ${output.exitCode})`}
                      </span>
                    </div>
                    {output.time !== undefined && (
                      <div className="flex items-center justify-between text-[10px] text-zinc-600 uppercase tracking-tighter">
                        <span>Execution Time</span>
                        <span className="text-zinc-400 font-medium">{output.time}ms</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[40vh] text-center px-6">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                    <Play className="h-5 w-5 text-zinc-700" />
                  </div>
                  <p className="text-zinc-600 text-xs leading-relaxed max-w-[200px]">
                    Click the <span className="text-blue-500 font-bold">Run</span> button to execute your code and see the results here.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
