import {createRequire} from 'module';
import {describe, it, expect} from 'vitest';

const require = createRequire(import.meta.url);
const {applyCommand, createRobots} = require('./simulation');

describe('simulation', () => {
  describe('applyCommand', () => {
  it('transitions idle robot to cleaning on start_clean', () => {
    const robot = createRobots()[0];
    expect(robot.status).toBe('idle');

    const applied = applyCommand(robot, 'start_clean');

    expect(applied).toBe(true);
    expect(robot.status).toBe('cleaning');
  });

  it('transitions cleaning robot to idle on stop', () => {
    const robot = createRobots()[0];
    applyCommand(robot, 'start_clean');

    const applied = applyCommand(robot, 'stop');

    expect(applied).toBe(true);
    expect(robot.status).toBe('idle');
  });

  it('returns robot to base position on return_home', () => {
    const robot = createRobots()[0];
    robot.lat = 50;
    robot.lng = 7;

    applyCommand(robot, 'return_home');

    expect(robot.lat).toBe(49.6116);
    expect(robot.lng).toBe(6.1319);
    expect(robot.status).toBe('idle');
  });
  });
});
