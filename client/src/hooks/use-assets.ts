import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

type CreateAssetInput = z.infer<typeof api.assets.create.input>;
type UpdateAssetInput = z.infer<typeof api.assets.update.input>;

export function useAssets() {
  return useQuery({
    queryKey: [api.assets.list.path],
    queryFn: async () => {
      const res = await fetch(api.assets.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch assets");
      return api.assets.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAssetInput) => {
      const res = await fetch(api.assets.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, value: String(data.value) }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create asset");
      return api.assets.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.assets.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.netWorth.history.path] });
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateAssetInput) => {
      const url = buildUrl(api.assets.update.path, { id });
      const payload = { ...data };
      if (payload.value) payload.value = String(payload.value);

      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update asset");
      return api.assets.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.assets.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.netWorth.history.path] });
    },
  });
}
