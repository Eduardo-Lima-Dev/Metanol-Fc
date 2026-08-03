// Distribuição de jogadores por time (RF06.3): times começam com `playersPerTeam`
// e o excedente (ou déficit) de jogadores é distribuído um a um, round-robin,
// mantendo no máximo 1 jogador de diferença entre os times.
export function computeTeamSizes(
  numberOfTeams: number,
  playersPerTeam: number,
  totalPlayers: number,
): number[] {
  const sizes = new Array<number>(numberOfTeams).fill(playersPerTeam);
  const diff = totalPlayers - numberOfTeams * playersPerTeam;

  if (diff > 0) {
    for (let i = 0; i < diff; i++) {
      sizes[i % numberOfTeams] += 1;
    }
  } else if (diff < 0) {
    for (let i = 0; i < -diff; i++) {
      const index = numberOfTeams - 1 - (i % numberOfTeams);
      sizes[index] = Math.max(0, sizes[index] - 1);
    }
  }

  return sizes;
}
