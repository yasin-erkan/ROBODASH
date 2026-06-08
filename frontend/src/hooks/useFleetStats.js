import {useMemo} from 'react';

export function useFleetStats(robots) {
  return useMemo(() => {
    const cleaning = robots.filter(r => r.status === 'cleaning').length;
    const lowBattery = robots.filter(r => r.battery < 20).length;
    const errors = robots.filter(r => r.status === 'error').length;
    const countries = new Set(robots.map(r => r.country)).size;
    return {cleaning, lowBattery, errors, countries};
  }, [robots]);
}
