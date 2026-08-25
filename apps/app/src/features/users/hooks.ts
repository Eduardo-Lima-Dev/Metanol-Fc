import { useMutation } from "@tanstack/react-query";
import type { User } from "@metanol/shared";
import { httpClient } from "../../core/api/httpClient";
import { endpoints } from "../../core/api/endpoints";

export function useFindUserByEmail() {
  return useMutation({
    mutationFn: (email: string) => httpClient.get<User>(endpoints.users.findByEmail(email)),
  });
}
