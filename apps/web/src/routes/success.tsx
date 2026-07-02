import { createFileRoute, useSearch } from "@tanstack/react-router";
import { z } from "zod";

// Type-safe URL search params: the schema is the single source of truth, so
// `useSearch({ from: "/success" })` is fully typed and runtime-validated.
const searchSchema = z.object({
  checkout_id: z.string().optional(),
});

const SuccessPage = () => {
  const { checkout_id } = useSearch({ from: "/success" });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1>Payment Successful!</h1>
      {checkout_id !== undefined && checkout_id !== "" && (
        <p>Checkout ID: {checkout_id}</p>
      )}
    </div>
  );
};

export const Route = createFileRoute("/success")({
  component: SuccessPage,
  validateSearch: searchSchema,
});
