interface ImportMeta {
  readonly env: Record<string, string | undefined>;
}

export interface CloudflareEnv {
  NODE_ENV: string;
  DATABASE_URL: string;
  CORS_ORIGIN: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  POLAR_ACCESS_TOKEN: string;
  POLAR_PRODUCT_ID: string;
  POLAR_SUCCESS_URL: string;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  HYPERDRIVE?: Hyperdrive;
  R2_BUCKET: R2Bucket;
  KV_CACHE: KVNamespace;
  USER_EVENTS: DurableObjectNamespace;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  POSTHOG_API_KEY?: string;
  POSTHOG_HOST?: string;
}

declare global {
  type Env = CloudflareEnv;
}

declare module "cloudflare:workers" {
  namespace Cloudflare {
    export interface Env extends CloudflareEnv {
      // Augmented by CloudflareEnv above
    }
  }
}
