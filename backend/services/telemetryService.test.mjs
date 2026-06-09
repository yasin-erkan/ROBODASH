import {createRequire} from 'module';
import {describe, it, expect} from 'vitest';

const require = createRequire(import.meta.url);
const {normalizeTelemetry} = require('./telemetryService');

describe('telemetryService', () => {
  describe('normalizeTelemetry', () => {
  it('normalizes robot_id and battery_level fields', () => {
    const result = normalizeTelemetry({
      robot_id: 'RB-101',
      battery_level: 88,
      latitude: 49.61,
      longitude: 6.13,
      status: 'cleaning',
      water_level: 65,
      panels_cleaned: 12,
    });

    expect(result.id).toBe('RB-101');
    expect(result.battery).toBe(88);
    expect(result.lat).toBe(49.61);
    expect(result.lng).toBe(6.13);
    expect(result.status).toBe('cleaning');
    expect(result.country).toBe('LU');
    expect(result.site).toBe('Luxembourg HQ');
  });

  it('fills missing fields from fleet registry', () => {
    const result = normalizeTelemetry({id: 'RB-102', battery: 70});

    expect(result.country).toBe('DE');
    expect(result.site).toBe('Munich Solar Park');
    expect(result.lat).toBeCloseTo(48.1351);
  });
  });
});
