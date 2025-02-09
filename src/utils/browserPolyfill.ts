/**
 * Browser polyfills for Node.js built-in modules
 */

export const fs = {
  readFileSync: (path: string, encoding: string): string => {
    throw new Error(
      `readFileSync is not supported in browser environment, Path: ${path}, Encoding: ${encoding}`
    );
  },
  existsSync: (path: string): boolean => {
    throw new Error(`existsSync is not supported in browser environment, Path: ${path}`);
  },
};

export const path = {
  join: (...paths: string[]): string => {
    return paths
      .map(path => path.replace(/^\/+|\/+$/g, ''))
      .filter(path => path.length)
      .join('/');
  },
};

export const process = {
  cwd: (): string => '/',
  env: {
    NODE_ENV: typeof window !== 'undefined' ? 'browser' : 'node',
  },
};
