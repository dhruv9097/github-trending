'use server';

import { exec } from 'child_process';
import { revalidatePath } from 'next/cache';
import { promisify } from 'util';
import os from 'os';
import path from 'path';

const execPromise = promisify(exec);

export async function syncGithubData() {
  try {
    // 1. Python interpreter: the repo's own .venv, overridable via PYTHON_BIN
    const repoRoot = process.cwd();
    const pythonPath =
      process.env.PYTHON_BIN ?? path.join(repoRoot, '.venv', 'bin', 'python');

    // 2. The scraper lives at the repo root
    const scriptPath = path.join(repoRoot, 'fetch_repos.py');

    console.log(`Running: ${pythonPath} ${scriptPath}`); // Debug log

    // 3. Execute using the specific python environment
    await execPromise(`${pythonPath} ${scriptPath}`);
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Sync error:', error);
    // Return the error message so you can see it in the UI if needed
    return { success: false, error: String(error) }; 
  }
}

export async function cloneRepo(fullName: string) {
  try {
    // This creates a folder named 'GitHub-Discovery' in your Downloads
    const targetBase = path.join(os.homedir(), 'Downloads', 'GitHub-Discovery');
    const projectPath = path.join(targetBase, fullName.replace('/', '-'));
    
    // Command to clone
    await execPromise(`mkdir -p ${targetBase} && git clone https://github.com/${fullName}.git ${projectPath}`);
    
    return { success: true, path: projectPath };
  } catch (error) {
    console.error('Clone error:', error);
    return { success: false };
  }
}