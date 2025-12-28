import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

type CreateExpenseInput = z.infer<typeof api.expenses.create.input>;

export function useExpenses(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: [api.expenses.list.path, params],
    queryFn: async () => {
      const url = params 
        ? buildUrl(api.expenses.list.path) + `?limit=${params.limit}&offset=${params.offset}`
        : api.expenses.list.path;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch expenses");
      return api.expenses.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateExpenseInput) => {
      // Ensure numeric fields are strings as per schema if coming from form as numbers
      const payload = {
        ...data,
        amount: String(data.amount),
        splits: data.splits?.map(split => ({
          ...split,
          amountOwed: String(split.amountOwed),
          percentage: String(split.percentage)
        }))
      };

      const res = await fetch(api.expenses.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create expense");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.expenses.list.path] });
      queryClient.invalidateQueries({ queryKey: ["/api/net-worth"] }); // Expenses affect net worth
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.expenses.delete.path, { id });
      const res = await fetch(url, { 
        method: "DELETE",
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete expense");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.expenses.list.path] });
    },
  });
}
