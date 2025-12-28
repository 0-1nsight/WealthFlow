import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useNetWorthHistory() {
  return useQuery({
    queryKey: [api.netWorth.history.path],
    queryFn: async () => {
      const res = await fetch(api.netWorth.history.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch net worth history");
      return api.netWorth.history.responses[200].parse(await res.json());
    },
  });
}
