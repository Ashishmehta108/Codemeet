import { useState } from "react";
import Editor, { type OnChange, type OnMount } from "@monaco-editor/react";
import { editor as monacoEditor } from "monaco-editor";
import dracula from "../themes/dracula.json";
import { Button } from "../components/ui/button";

export default function CodeEditor() {
  const [code, setCode] = useState<string>(`// Write your TypeScript code here
function greet(name: string): string {
  return 'Hello, ' + name + '!';
}

console.log(greet('World'));
`);

  const [theme, setTheme] = useState("vs-dark");
  const handleEditorMount: OnMount = (_, monaco) => {
    monaco.editor.defineTheme("dracula", {
      base: "vs-dark",
      inherit: true,
      rules: dracula.rules,
      colors: dracula.colors,
    });

    monaco.editor.setTheme(theme);
  };

  const handleEditorChange: OnChange = (value) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const changeThemeToDracula = () => {
    setTheme("dracula");
    monacoEditor.setTheme("dracula");
  };

  return (
    <div>
      <Editor
        height="90vh"
        defaultLanguage="typescript"
        value={code}
        defaultPath="main.ts"
        onChange={handleEditorChange}
        onMount={handleEditorMount}
        theme={theme}
        options={{
          fontSize: 16,
          minimap: { enabled: true },
          wordWrap: "on",
          tabSize: 2,
        }}
      />
      <Button onClick={changeThemeToDracula}>Change Theme</Button>
    </div>
  );
}
