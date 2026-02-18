// Type declarations for Deno runtime globals
// This suppresses TypeScript errors when editing Supabase Edge Functions in VS Code
// without the Deno extension. The actual runtime is Deno.

declare namespace Deno {
    export interface Env {
        get(key: string): string | undefined;
        set(key: string, value: string): void;
        delete(key: string): void;
        toObject(): Record<string, string>;
    }
    export const env: Env;

    export function serve(
        handler: (req: Request) => Response | Promise<Response>,
        options?: { port?: number; hostname?: string }
    ): void;
}

// Ensure fetch, Response, Request, console are available (they are in Deno)
declare function fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
