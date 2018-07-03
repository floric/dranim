import { ProcessState } from '../src/workspace';

describe('Workspace', () => {
  test('should have correct values in ProcessState', async () => {
    expect(ProcessState.ERROR).toBe('ERROR');
    expect(ProcessState.PROCESSING).toBe('PROCESSING');
    expect(ProcessState.STARTED).toBe('STARTED');
    expect(ProcessState.SUCCESSFUL).toBe('SUCCESSFUL');
  });
});
