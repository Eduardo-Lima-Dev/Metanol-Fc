import { median } from './median';

describe('median', () => {
  it('returns null for an empty list', () => {
    expect(median([])).toBeNull();
  });

  it('returns the single value for a list of one', () => {
    expect(median([3.5])).toBe(3.5);
  });

  it('returns the middle value for an odd-length list', () => {
    expect(median([1, 5, 3])).toBe(3);
  });

  it('returns the average of the two middle values for an even-length list', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it('does not depend on input order', () => {
    expect(median([5, 1, 4, 2, 3])).toBe(3);
  });

  it('does not mutate the input array', () => {
    const scores = [3, 1, 2];
    median(scores);
    expect(scores).toEqual([3, 1, 2]);
  });
});
