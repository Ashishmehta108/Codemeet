export type Language =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'go'
  | 'java'
  | 'cpp'
  | 'rust'
  | 'html'
  | 'css'

export interface ExecutionRequest {
  code: string;
  language: Language;
}

export interface ExecutionResponse {
  stdout: string;
  stderr: string;
  exitCode: number;
  time?: number;
  memory?: number;
}
