import type { AstroGlobal } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export class Cache {
  private cacheDir: string;

  constructor(cacheDir: string) {
    this.cacheDir = cacheDir;
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set(key: string, data: any, expiresIn?: number): void {
    const filePath = path.join(this.cacheDir, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8');

    if (expiresIn) {
      const expirationTime = Date.now() + expiresIn;
      fs.writeFileSync(
        filePath.replace('.json', '.expires'),
        JSON.stringify(expirationTime),
        'utf-8'
      );
    }
  }

  get<T>(key: string): T | null {
    const filePath = path.join(this.cacheDir, `${key}.json`);
    const expiresPath = path.join(this.cacheDir, `${key}.expires`);

    if (fs.existsSync(filePath)) {
      try {
        const data = fs.readFileSync(filePath, 'utf-8');

        // Check if file is empty or whitespace only
        if (!data.trim()) {
          console.warn(`Cache file for key "${key}" is empty, clearing cache`);
          this.clear(key);
          return null;
        }

        let expirationTime: number | null = null;
        if (fs.existsSync(expiresPath)) {
          try {
            const expiresData = fs.readFileSync(expiresPath, 'utf-8');
            expirationTime = JSON.parse(expiresData);
          } catch (error) {
            console.warn(`Invalid expiration file for key "${key}", clearing cache:`, error);
            this.clear(key);
            return null;
          }
        }

        if (expirationTime && Date.now() > expirationTime) {
          this.clear(key);
          return null;
        }

        return JSON.parse(data) as T;
      } catch (error) {
        console.warn(`Failed to parse cache file for key "${key}":`, error);
        this.clear(key);
        return null;
      }
    }
    return null;
  }

  clear(key: string): void {
    const filePath = path.join(this.cacheDir, `${key}.json`);
    const expiresPath = path.join(this.cacheDir, `${key}.expires`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    if (fs.existsSync(expiresPath)) {
      fs.unlinkSync(expiresPath);
    }
  }

  clearAll(): void {
    const files = fs.readdirSync(this.cacheDir);
    for (const file of files) {
      fs.unlinkSync(path.join(this.cacheDir, file));
    }
  }

  has(key: string): boolean {
    const filePath = path.join(this.cacheDir, `${key}.json`);
    const expiresPath = path.join(this.cacheDir, `${key}.expires`);

    if (fs.existsSync(filePath)) {
      try {
        // Check if file is empty
        const data = fs.readFileSync(filePath, 'utf-8');
        if (!data.trim()) {
          this.clear(key);
          return false;
        }

        if (fs.existsSync(expiresPath)) {
          try {
            const expirationTime = JSON.parse(fs.readFileSync(expiresPath, 'utf-8'));
            if (Date.now() > expirationTime) {
              this.clear(key);
              return false;
            }
          } catch (error) {
            console.warn(`Invalid expiration file for key "${key}", clearing cache:`, error);
            this.clear(key);
            return false;
          }
        }
        return true;
      } catch (error) {
        console.warn(`Error checking cache for key "${key}":`, error);
        this.clear(key);
        return false;
      }
    }
    return false;
  }

  getAllKeys(): string[] {
    const files = fs.readdirSync(this.cacheDir);
    return files.map((file) => path.basename(file, '.json'));
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
