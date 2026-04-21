import type { Exporter } from "@ultimate-ts-starter/logging/types";

/**
 * Structured JSON exporter for production log pipelines.
 * Emits one JSON line per event — compatible with OTEL Collector,
 * Fluent Bit, Vector, Datadog, or any structured log ingestion.
 */
export const jsonExporter = (): Exporter => ({
  emit(event) {
    const logFn = event.outcome === "error" ? console.error : console.log;
    logFn(JSON.stringify(event));
  },
});
