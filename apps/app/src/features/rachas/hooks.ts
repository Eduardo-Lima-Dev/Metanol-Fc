import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateRachaInput,
  Racha,
  RachaMemberRole,
  RachaMemberWithUser,
  RachaWithRole,
  UpdateRachaInput,
} from "@metanol/shared";
import { httpClient } from "../../core/api/httpClient";
import { endpoints } from "../../core/api/endpoints";

export function useRachas() {
  return useQuery({
    queryKey: ["rachas"],
    queryFn: () => httpClient.get<RachaWithRole[]>(endpoints.rachas.list),
  });
}

export function useRacha(rachaId: string) {
  return useQuery({
    queryKey: ["rachas", rachaId],
    queryFn: () => httpClient.get<Racha>(endpoints.rachas.detail(rachaId)),
  });
}

// O papel do usuário atual num racha só existe em RachaWithRole (GET /rachas);
// `Racha.createdBy` é o criador original e não reflete admins promovidos depois.
export function useRachaRole(rachaId: string) {
  const { data } = useRachas();
  return data?.find((racha) => racha.id === rachaId)?.role ?? null;
}

export function useCreateRacha() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRachaInput) =>
      httpClient.post<Racha>(endpoints.rachas.create, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rachas"] }),
  });
}

export function useUpdateRacha(rachaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateRachaInput) =>
      httpClient.patch<Racha>(endpoints.rachas.update(rachaId), input),
    onSuccess: (data) => {
      queryClient.setQueryData(["rachas", rachaId], data);
      queryClient.invalidateQueries({ queryKey: ["rachas"] });
    },
  });
}

export function useSetEvaluationsOpen(rachaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (open: boolean) =>
      httpClient.patch<Racha>(endpoints.rachas.setEvaluationsOpen(rachaId), { rachaId, open }),
    onSuccess: (data) => queryClient.setQueryData(["rachas", rachaId], data),
  });
}

export function useSetTeamSplitOpenToMembers(rachaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (open: boolean) =>
      httpClient.patch<Racha>(endpoints.rachas.setTeamSplitOpenToMembers(rachaId), {
        rachaId,
        open,
      }),
    onSuccess: (data) => queryClient.setQueryData(["rachas", rachaId], data),
  });
}

export function useRachaMembers(rachaId: string) {
  return useQuery({
    queryKey: ["rachas", rachaId, "members"],
    queryFn: () => httpClient.get<RachaMemberWithUser[]>(endpoints.rachas.members(rachaId)),
  });
}

export function useAddRachaMember(rachaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      httpClient.post(endpoints.rachas.members(rachaId), { rachaId, userId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rachas", rachaId, "members"] }),
  });
}

export function useRemoveRachaMember(rachaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      httpClient.delete(endpoints.rachas.removeMember(rachaId, userId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rachas", rachaId, "members"] }),
  });
}

export function useSetRachaMemberRole(rachaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: RachaMemberRole }) =>
      httpClient.patch(endpoints.rachas.setMemberRole(rachaId, userId), {
        rachaId,
        userId,
        role,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rachas", rachaId, "members"] }),
  });
}
