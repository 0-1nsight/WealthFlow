import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

type UpdateProfileInput = z.infer<typeof api.userProfile.update.input>;

export function useUserProfile() {
  return useQuery({
    queryKey: [api.userProfile.get.path],
    queryFn: async () => {
      const res = await fetch(api.userProfile.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.userProfile.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      const payload = { ...data };
      if (payload.monthlyIncome) payload.monthlyIncome = String(payload.monthlyIncome);

      const res = await fetch(api.userProfile.update.path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return api.userProfile.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.userProfile.get.path] });
    },
  });
}
