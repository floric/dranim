import { DataType, SocketType } from '../src/sockets';

describe('Sockets', () => {
  test('should have correct values in SocketType and DataType', async () => {
    expect(SocketType.INPUT).toBe('INPUT');
    expect(SocketType.OUTPUT).toBe('OUTPUT');

    expect(DataType.DATASET).toBe('Dataset');
    expect(DataType.NUMBER).toBe('Number');
    expect(DataType.BOOLEAN).toBe('Boolean');
    expect(DataType.DATETIME).toBe('Datetime');
    expect(DataType.TIME).toBe('Time');
    expect(DataType.STRING).toBe('String');
  });
});
