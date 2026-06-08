import {SimpleGrid, Text} from '@mantine/core';
import StatCard from './StatCard';
import RobotCard from './RobotCard';

export default function FleetSidebar({
  robots,
  stats,
  connected,
  lastUpdate,
  selectedId,
  onSelectRobot,
  onCommand,
  canCommand,
}) {
  const lastUpdateLabel = lastUpdate
    ? lastUpdate.toLocaleTimeString('en-US')
    : connected
      ? 'Connected — waiting for telemetry...'
      : 'Waiting for backend...';

  return (
    <>
      <SimpleGrid cols={4} mb="md" spacing="xs">
        <StatCard label="Countries" value={stats.countries} color="blue" />
        <StatCard label="Cleaning" value={stats.cleaning} color="green" />
        <StatCard label="Low Batt." value={stats.lowBattery} color="orange" />
        <StatCard label="Errors" value={stats.errors} color="red" />
      </SimpleGrid>

      <Text size="sm" c="dimmed" mb="sm">
        Last update: {lastUpdateLabel}
      </Text>

      <Text fw={600} mb="md">
        Robot List ({robots.length})
      </Text>

      <SimpleGrid cols={1} spacing="sm">
        {robots.map(robot => (
          <RobotCard
            key={robot.id}
            robot={robot}
            selected={selectedId === robot.id}
            onSelect={onSelectRobot}
            onCommand={onCommand}
            canCommand={canCommand}
          />
        ))}
      </SimpleGrid>
    </>
  );
}
