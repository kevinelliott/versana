'use client';

/**
 * Tauri Bridge Utility
 * Safe wrapper to detect and use Tauri OS functions when running inside the Native App shell.
 * Fallbacks to web standards if running in standard Next.js Chrome/Safari environment.
 */

// We lazily import @tauri-apps/api to avoid SSR crash in Next.js Server Components
let tauriApi: any = null;
let isTauriEnv = false;

if (typeof window !== 'undefined') {
    // Tauri injects window.__TAURI_IPC__ when running natively
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isTauriEnv = !!(window as any).__TAURI_IPC__;
    
    if (isTauriEnv) {
        import('@tauri-apps/api').then((api) => {
            tauriApi = api;
            console.log("Tauri Native Bridge Initialized");
        }).catch(err => {
            console.warn("Failed to load Tauri API:", err);
        });
    }
}

export const isDesktopApp = () => isTauriEnv;

/**
 * OS-Native Dialog hook.
 * Will throw an error if used outside Tauri without a catch.
 */
export const openNativeSaveDialog = async (defaultPath: string, filters: { name: string, extensions: string[] }[]) => {
    if (!isTauriEnv || !tauriApi) throw new Error("Not running in Tauri Desktop environment");
    
    const { dialog } = tauriApi;
    const filePath = await dialog.save({
        defaultPath,
        filters
    });
    return filePath; // returns selected path string or null if cancelled
};

/**
 * Read content from local filesystem (Tauri only)
 */
export const readLocalFile = async (filePath: string) => {
    if (!isTauriEnv || !tauriApi) throw new Error("Not running in Tauri Desktop environment");
    
    const { fs } = tauriApi;
    return await fs.readTextFile(filePath);
};

/**
 * Write binary/text content to local filesystem (Tauri only)
 */
export const writeLocalFile = async (filePath: string, contents: string | Uint8Array) => {
    if (!isTauriEnv || !tauriApi) throw new Error("Not running in Tauri Desktop environment");
    
    const { fs } = tauriApi;
    if (typeof contents === 'string') {
        await fs.writeTextFile(filePath, contents);
    } else {
        await fs.writeBinaryFile(filePath, contents);
    }
    return true;
};
