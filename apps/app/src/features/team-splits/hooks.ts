import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  RecordTeamSplitResultInput,
  TeamSplit,
  TeamSplitParams,
  TeamSplitPlayerRankingEntry,
} from "@metanol/shared";
import { httpClient } from "../../core/api/httpClient";
import { endpoints } from "../../core/api/endpoints";

type GenerateTeamSplitResponse = {
  id: string;
  createdAt: string;
  teams: { index: number; playerIds: string[] }[];
  bestFitness: number;
  params: TeamSplitParams;
};

type TeamSplitPage = {
  items: TeamSplit[];
  page: number;
  pageSize: number;
  total: number;
};

export function useGenerateTeamSplit(rachaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { presentPlayerIds: string[]; params: TeamSplitParams }) =>
      httpClient.post<GenerateTeamSplitResponse>(endpoints.teamSplits.generate(rachaId), input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["rachas", rachaId, "team-splits"] }),
  });
}

export function useTeamSplits(rachaId: string, page: number, pageSize = 10) {
  return useQuery({
    queryKey: ["rachas", rachaId, "team-splits", "list", page],
    queryFn: () =>
      httpClient.get<TeamSplitPage>(endpoints.teamSplits.list(rachaId, page, pageSize)),
  });
}

export function useTeamSplit(rachaId: string, teamSplitId: string) {
  return useQuery({
    queryKey: ["rachas", rachaId, "team-splits", "detail", teamSplitId],
    queryFn: () => httpClient.get<TeamSplit>(endpoints.teamSplits.detail(rachaId, teamSplitId)),
  });
}

export function useTeamSplitRanking(rachaId: string) {
  return useQuery({
    queryKey: ["rachas", rachaId, "team-splits", "ranking"],
    queryFn: () =>
      httpClient.get<TeamSplitPlayerRankingEntry[]>(endpoints.teamSplits.ranking(rachaId)),
  });
}

export function useRecordTeamSplitResult(rachaId: string, teamSplitId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RecordTeamSplitResultInput) =>
      httpClient.patch<TeamSplit>(endpoints.teamSplits.recordResult(rachaId, teamSplitId), input),
    onSuccess: (data) => {
      queryClient.setQueryData(["rachas", rachaId, "team-splits", "detail", teamSplitId], data);
      queryClient.invalidateQueries({ queryKey: ["rachas", rachaId, "team-splits", "ranking"] });
    },
  });
}
