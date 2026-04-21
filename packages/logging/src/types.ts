/**
 * A wide event captures everything that happened during a single request
 * in one comprehensive, structured record.
 *
 * Instead of scattered log lines, one event per request per service.
 * Handlers enrich the event with domain-specific fields throughout
 * the request lifecycle. The middleware emits it once at completion.
 *
 * @see https://loggingsucks.com
 */
export interface WideEvent {
  request_id: string;
  trace_id?: string;
  parent_id?: string;
  timestamp: string;
  service: string;
  version?: string;
  method: string;
  path: string;
  status_code: number;
  duration_ms: number;
  outcome: "success" | "error";
  error?: {
    type: string;
    message: string;
    stack?: string;
  };
  [key: string]: unknown;
}

export interface Exporter {
  emit(event: WideEvent): void | Promise<void>;
}

export interface SamplingConfig {
  /** Always sample errors (default: true) */
  alwaysSampleErrors?: boolean;
  /** Always sample requests slower than this (ms) */
  slowThresholdMs?: number;
  /** Base sample rate for normal requests (0-1, default: 1) */
  defaultRate?: number;
  /** Custom predicate — return true to force-sample */
  custom?: (event: WideEvent) => boolean;
}

export interface WideEventConfig {
  service: string;
  version?: string;
  sampling?: SamplingConfig;
  exporter?: Exporter;
  /** Called on every error — use to forward to error tracking (PostHog, Sentry, etc.) */
  onError?: (error: Error, event: WideEvent) => void;
}

export interface WideEventVariables {
  wideEvent: WideEvent;
}
