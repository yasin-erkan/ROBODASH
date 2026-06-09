import {createRequire} from 'module';
import {describe, it, expect, vi} from 'vitest';

const require = createRequire(import.meta.url);
const {dispatchCommand} = require('./commandService');

const mockIo = () => ({emit: vi.fn()});
const mockPushLog = vi.fn(async () => {});

describe('commandService', () => {
  describe('dispatchCommand', () => {
  it('rejects commands from viewer role (RBAC)', async () => {
    const result = await dispatchCommand(
      mockIo(),
      {robotId: 'RB-101', action: 'start_clean'},
      {
        userRole: 'viewer',
        pushLog: mockPushLog,
        simApply: () => true,
      },
    );

    expect(result.ok).toBe(false);
    expect(result.error).toBe('Forbidden');
  });

  it('allows operator to send start_clean', async () => {
    const io = mockIo();
    const simApply = vi.fn(() => true);

    const result = await dispatchCommand(
      io,
      {robotId: 'RB-101', action: 'start_clean'},
      {
        userRole: 'operator',
        issuedBy: 'operator',
        pushLog: mockPushLog,
        simApply,
      },
    );

    expect(result.ok).toBe(true);
    expect(simApply).toHaveBeenCalledWith('RB-101', 'start_clean');
    expect(io.emit).toHaveBeenCalledWith('command:ack', {
      robotId: 'RB-101',
      action: 'start_clean',
      ok: true,
    });
  });

  it('rejects invalid action', async () => {
    const result = await dispatchCommand(
      mockIo(),
      {robotId: 'RB-101', action: 'explode'},
      {simApply: () => true, pushLog: mockPushLog},
    );

    expect(result.ok).toBe(false);
    expect(result.error).toBe('Invalid command');
  });
  });
});
