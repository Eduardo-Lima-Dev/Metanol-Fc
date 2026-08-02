import { computeTeamSizes } from './team-sizes';

describe('computeTeamSizes', () => {
  it('divides evenly when players match teams * playersPerTeam exactly', () => {
    expect(computeTeamSizes(4, 5, 20)).toEqual([5, 5, 5, 5]);
  });

  it('distributes the excess round-robin, first teams first (RF06.3)', () => {
    const sizes = computeTeamSizes(4, 5, 23);
    expect(sizes).toEqual([6, 6, 6, 5]);
    expect(sizes.reduce((a, b) => a + b, 0)).toBe(23);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
  });

  it('reduces round-robin from the last teams on a deficit', () => {
    const sizes = computeTeamSizes(4, 5, 17);
    expect(sizes).toEqual([5, 4, 4, 4]);
    expect(sizes.reduce((a, b) => a + b, 0)).toBe(17);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
  });
});
