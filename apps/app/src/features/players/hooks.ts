import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AddGuestPlayerInput, Player, UpdatePlayerStatsInput } from "@metanol/shared";
import { httpClient } from "../../core/api/httpClient";
import { endpoints } from "../../core/api/endpoints";

export type ImportAveragesResult = {
  line: number;
  identifier?: string;
  status: "ok" | "error";
  message?: string;
};

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
      httpClient.uploadFile<ImportAveragesResult[]>(
        endpoints.players.importAverages(rachaId),
        formData,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["rachas", rachaId, "players"] }),
  });
}

export function useImportAveragesText(rachaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      httpClient.post<ImportAveragesResult[]>(endpoints.players.importAverages(rachaId), {
        content,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["rachas", rachaId, "players"] }),
  });
}
