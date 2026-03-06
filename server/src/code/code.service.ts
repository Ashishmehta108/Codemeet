import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { Language, ExecutionResponse } from '../../../shared/src/types/code';

const execPromise = promisify(exec);

@Injectable()
export class CodeService {
  private readonly tempDir = path.join(process.cwd(), 'temp');

  constructor() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir);
    }
  }

  async execute(language: Language, code: string): Promise<ExecutionResponse> {
    const id = Math.random().toString(36).substring(2, 15);
    const folderPath = path.join(this.tempDir, id);
    fs.mkdirSync(folderPath, { recursive: true });

    try {
      const fileName = this.getFileName(language);
      const filePath = path.join(folderPath, fileName);
      fs.writeFileSync(filePath, code);

      const dockerImage = this.getDockerImage(language);
      const runCommand = this.getRunCommand(language, fileName);

      // Set timeout for execution (e.g., 10 seconds)
      const timeout = 10000;
      const memoryLimit = '256m';
      const cpuLimit = '0.5';

      const dockerCmd = `docker run --rm \
        --network none \
        --memory ${memoryLimit} \
        --cpus ${cpuLimit} \
        -v ${folderPath}:/app \
        -w /app \
        ${dockerImage} \
        /bin/sh -c "${runCommand}"`;

      const startTime = Date.now();
      const { stdout, stderr } = await execPromise(dockerCmd, { timeout });
      const endTime = Date.now();

      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 0,
        time: endTime - startTime,
      };
    } catch (error: any) {
      console.error('Execution error:', error);
      return {
        stdout: error.stdout?.trim() || '',
        stderr: error.stderr?.trim() || error.message,
        exitCode: error.code || 1,
      };
    } finally {
      // Cleanup: Remove temp directory
      try {
        if (fs.existsSync(folderPath)) {
          fs.rmSync(folderPath, { recursive: true, force: true });
        }
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
  }

  private getFileName(language: Language): string {
    switch (language) {
      case 'typescript': return 'main.ts';
      case 'javascript': return 'main.js';
      case 'python': return 'main.py';
      case 'go': return 'main.go';
      case 'java': return 'Main.java';
      case 'cpp': return 'main.cpp';
      case 'rust': return 'main.rs';
      case 'html': return 'index.html';
      case 'css': return 'style.css';
      default: return 'main.txt';
    }
  }

  private getDockerImage(language: Language): string {
    switch (language) {
      case 'typescript': return 'node:18-alpine';
      case 'javascript': return 'node:18-alpine';
      case 'python': return 'python:3.10-alpine';
      case 'go': return 'golang:1.20-alpine';
      case 'java': return 'openjdk:17-alpine';
      case 'cpp': return 'gcc:latest';
      case 'rust': return 'rust:1.70-alpine';
      default: return 'alpine:latest';
    }
  }

  private getRunCommand(language: Language, fileName: string): string {
    switch (language) {
      case 'typescript':
        return `node ${fileName}`;
      case 'javascript': return `node ${fileName}`;
      case 'python': return `python3 ${fileName}`;
      case 'go': return `go run ${fileName}`;
      case 'java': return `javac ${fileName} && java Main`;
      case 'cpp': return `g++ -o main ${fileName} && ./main`;
      case 'rust': return `rustc ${fileName} -o main && ./main`;
      case 'html': return `cat ${fileName}`;
      default: return `cat ${fileName}`;
    }
  }
}
