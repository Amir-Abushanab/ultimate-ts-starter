import { createFileRoute, useSearch } from "@tanstack/react-router";

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
  validateSearch: (search) => ({
    checkout_id:
      typeof search.checkout_id === "string" ? search.checkout_id : undefined,
  }),
});
