import { useMutation } from "@tanstack/react-query";
import { httpClient } from "../../core/api/httpClient";
import { endpoints } from "../../core/api/endpoints";

export function useCreateEvaluation(rachaId: string) {
  return useMutation({
    mutationFn: ({ evaluatedPlayerId, score }: { evaluatedPlayerId: string; score: number | null }) =>
      httpClient.post(endpoints.evaluations.create(rachaId), { evaluatedPlayerId, score }),
  });
}
