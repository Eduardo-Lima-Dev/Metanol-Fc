export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
  },
  users: {
    me: "/users/me",
    findByEmail: (email: string) => `/users?email=${encodeURIComponent(email)}`,
  },
  rachas: {
    list: "/rachas",
    create: "/rachas",
    detail: (rachaId: string) => `/rachas/${rachaId}`,
    update: (rachaId: string) => `/rachas/${rachaId}`,
    setEvaluationsOpen: (rachaId: string) => `/rachas/${rachaId}/evaluations-open`,
    setTeamSplitOpenToMembers: (rachaId: string) =>
      `/rachas/${rachaId}/team-split-open-to-members`,
    members: (rachaId: string) => `/rachas/${rachaId}/members`,
    removeMember: (rachaId: string, userId: string) => `/rachas/${rachaId}/members/${userId}`,
    setMemberRole: (rachaId: string, userId: string) =>
      `/rachas/${rachaId}/members/${userId}/role`,
  },
  players: {
    list: (rachaId: string) => `/rachas/${rachaId}/players`,
    updateStats: (rachaId: string, playerId: string) =>
      `/rachas/${rachaId}/players/${playerId}/stats`,
    addGuest: (rachaId: string) => `/rachas/${rachaId}/players/guests`,
    importAverages: (rachaId: string) => `/rachas/${rachaId}/players/import-averages`,
  },
  evaluations: {
    create: (rachaId: string) => `/rachas/${rachaId}/evaluations`,
  },
  teamSplits: {
    generate: (rachaId: string) => `/rachas/${rachaId}/team-splits/generate`,
    list: (rachaId: string, page: number, pageSize: number) =>
      `/rachas/${rachaId}/team-splits?page=${page}&pageSize=${pageSize}`,
    ranking: (rachaId: string) => `/rachas/${rachaId}/team-splits/ranking`,
    detail: (rachaId: string, teamSplitId: string) =>
      `/rachas/${rachaId}/team-splits/${teamSplitId}`,
    recordResult: (rachaId: string, teamSplitId: string) =>
      `/rachas/${rachaId}/team-splits/${teamSplitId}/result`,
  },
};
