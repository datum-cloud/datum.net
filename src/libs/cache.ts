import type { AstroGlobal } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

export class Cache {
  private cacheDir: string;

  constructor(cacheDir: string) {
    this.cacheDir = cacheDir;
  }

  private async ensureDir(): Promise<void> {
    await fs.mkdir(this.cacheDir, { recursive: true });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async set(key: string, data: any, expiresIn?: number): Promise<void> {
    await this.ensureDir();

    const filePath = path.join(this.cacheDir, `${key}.json`);
    await fs.writeFile(filePath, JSON.stringify(data), 'utf-8');

    if (expiresIn) {
      const expirationTime = Date.now() + expiresIn;
      await fs.writeFile(
        filePath.replace('.json', '.expires'),
        JSON.stringify(expirationTime),
        'utf-8'
      );
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const filePath = path.join(this.cacheDir, `${key}.json`);
    const expiresPath = path.join(this.cacheDir, `${key}.expires`);

    try {
      const data = await fs.readFile(filePath, 'utf-8');

      if (!data.trim()) {
        console.warn(`Cache file for key "${key}" is empty, clearing cache`);
        await this.clear(key);
        return null;
      }

      let expirationTime: number | null = null;
      try {
        const expiresData = await fs.readFile(expiresPath, 'utf-8');
        expirationTime = JSON.parse(expiresData);
      } catch {
        // No expires file or invalid — treat as no expiry
      }

      if (expirationTime && Date.now() > expirationTime) {
        await this.clear(key);
        return null;
      }

      return JSON.parse(data) as T;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      console.warn(`Failed to parse cache file for key "${key}":`, err);
      await this.clear(key);
      return null;
    }
  }

  async clear(key: string): Promise<void> {
    const filePath = path.join(this.cacheDir, `${key}.json`);
    const expiresPath = path.join(this.cacheDir, `${key}.expires`);
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore ENOENT
    }
    try {
      await fs.unlink(expiresPath);
    } catch {
      // Ignore ENOENT
    }
  }

  async clearAll(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      await Promise.all(files.map((file) => fs.unlink(path.join(this.cacheDir, file))));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw err;
      }
    }
  }

  async has(key: string): Promise<boolean> {
    const filePath = path.join(this.cacheDir, `${key}.json`);
    const expiresPath = path.join(this.cacheDir, `${key}.expires`);

    try {
      const data = await fs.readFile(filePath, 'utf-8');
      if (!data.trim()) {
        await this.clear(key);
        return false;
      }

      try {
        const expiresData = await fs.readFile(expiresPath, 'utf-8');
        const expirationTime = JSON.parse(expiresData);
        if (Date.now() > expirationTime) {
          await this.clear(key);
          return false;
        }
      } catch {
        // No expires file — treat as valid
      }
      return true;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      console.warn(`Error checking cache for key "${key}":`, err);
      await this.clear(key);
      return false;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.cacheDir);
      return files.map((file) => path.basename(file, '.json'));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw err;
    }
  }

  setCacheHeader(type: 'long' | 'short') {
    return type === 'long'
      ? (Astro: AstroGlobal) => {
          Astro.response.headers.set(
            'Cache-Control',
            'public, max-age=60, stale-while-revalidate=120'
          );
        }
      : (Astro: AstroGlobal) => {
          Astro.response.headers.set(
            'Cache-Control',
            'public, max-age=1, stale-while-revalidate=9'
          );
        };
  }
}
