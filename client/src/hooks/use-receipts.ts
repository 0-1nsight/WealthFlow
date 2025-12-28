import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

type ProcessReceiptInput = z.infer<typeof api.receipts.process.input>;

export function useProcessReceipt() {
  return useMutation({
    mutationFn: async (data: ProcessReceiptInput) => {
      const res = await fetch(api.receipts.process.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to process receipt");
      return api.receipts.process.responses[200].parse(await res.json());
    },
  });
}
