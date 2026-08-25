import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AddGuestPlayerInput, Player, UpdatePlayerStatsInput } from "@metanol/shared";
import { httpClient } from "../../core/api/httpClient";
import { endpoints } from "../../core/api/endpoints";

export function usePlayers(rachaId: string) {
  return useQuery({
    queryKey: ["rachas", rachaId, "players"],
    queryFn: () => httpClient.get<Player[]>(endpoints.players.list(rachaId)),
  });
}

export function useUpdatePlayerStats(rachaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ playerId, input }: { playerId: string; input: UpdatePlayerStatsInput }) =>
      httpClient.patch<Player>(endpoints.players.updateStats(rachaId, playerId), input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["rachas", rachaId, "players"] }),
  });
}

export function useAddGuestPlayer(rachaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<AddGuestPlayerInput, "rachaId">) =>
      httpClient.post<Player>(endpoints.players.addGuest(rachaId), { rachaId, ...input }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["rachas", rachaId, "players"] }),
  });
}

export function useImportAverages(rachaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      httpClient.uploadFile(endpoints.players.importAverages(rachaId), formData),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["rachas", rachaId, "players"] }),
  });
}
