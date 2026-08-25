import { parsePlayerAveragesFile } from './player-averages-parser';

describe('parsePlayerAveragesFile', () => {
  it('parses valid lines with dot or comma decimal separator', () => {
    const result = parsePlayerAveragesFile('dudu@metanolfc.com;4.5\nkaua;3,5');

    expect(result).toEqual([
      { line: 1, raw: 'dudu@metanolfc.com;4.5', identifier: 'dudu@metanolfc.com', average: 4.5 },
      { line: 2, raw: 'kaua;3,5', identifier: 'kaua', average: 3.5 },
    ]);
  });

  it('ignores empty lines and comments', () => {
    const result = parsePlayerAveragesFile('dudu;4\n\n# comentário\nkaua;3');

    expect(result).toHaveLength(2);
    expect(result[0].identifier).toBe('dudu');
    expect(result[1].identifier).toBe('kaua');
  });

  it('reports an error for a line without the expected separator', () => {
    const result = parsePlayerAveragesFile('dudu-sem-separador');

    expect(result[0].error).toBe('Formato esperado: identificador;media');
  });

  it('reports an error for a non-numeric average', () => {
    const result = parsePlayerAveragesFile('dudu;abc');

    expect(result[0].error).toBe('Média inválida');
  });

  it('reports an error for an average out of the 0..5 range', () => {
    const result = parsePlayerAveragesFile('dudu;7');

    expect(result[0].error).toBe('Média deve estar entre 0 e 5');
  });

  it('keeps line numbers aligned with the original file even with skipped lines', () => {
    const result = parsePlayerAveragesFile('\ndudu;4');

    expect(result[0].line).toBe(2);
  });
});
