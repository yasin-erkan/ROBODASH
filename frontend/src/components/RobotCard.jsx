import {Badge, Button, Group, Paper, Progress, Text} from '@mantine/core';
import {COUNTRY_NAMES} from '../data/fleet';
import {STATUS} from '../constants/status';

export default function RobotCard({robot, selected, onSelect, onCommand, canCommand}) {
  const status = STATUS[robot.status] || STATUS.idle;

  return (
    <Paper
      p="sm"
      radius="md"
      className={`glass-panel robot-card${selected ? ' selected' : ''}`}
      onClick={() => onSelect(robot.id)}
      style={{cursor: 'pointer'}}>
      <Group justify="space-between" mb={6}>
        <div>
          <Text fw={700}>{robot.id}</Text>
          <Text size="xs" c="dimmed">
            {COUNTRY_NAMES[robot.country] || robot.country} · {robot.site}
          </Text>
        </div>
        <Badge color={status.color} variant="light">
          {status.label}
        </Badge>
      </Group>

      <Group gap={6} mb={4}>
        <Text size="xs">Battery</Text>
        <Text size="xs" fw={600} ml="auto">
          {Math.round(robot.battery)}%
        </Text>
      </Group>
      <Progress
        value={robot.battery}
        color={robot.battery < 20 ? 'red' : 'blue'}
        size="sm"
        mb="xs"
      />

      <Group gap={6} mb={4}>
        <Text size="xs">Water Level</Text>
        <Text size="xs" fw={600} ml="auto">
          {Math.round(robot.water_level)}%
        </Text>
      </Group>
      <Progress
        value={robot.water_level}
        color={robot.water_level < 15 ? 'orange' : 'cyan'}
        size="sm"
        mb="xs"
      />

      <Text size="xs" c="dimmed" mb="xs">
        {robot.lat.toFixed(4)}, {robot.lng.toFixed(4)} · {robot.panels_cleaned}{' '}
        panels
      </Text>

      {canCommand && (
        <Group gap={6} onClick={e => e.stopPropagation()}>
          <Button
            size="compact-xs"
            variant="light"
            color="green"
            disabled={robot.status === 'cleaning' || robot.status === 'error'}
            onClick={() => onCommand(robot.id, 'start_clean')}>
            Start
          </Button>
          <Button
            size="compact-xs"
            variant="light"
            color="orange"
            disabled={robot.status !== 'cleaning'}
            onClick={() => onCommand(robot.id, 'stop')}>
            Stop
          </Button>
          <Button
            size="compact-xs"
            variant="light"
            color="blue"
            disabled={robot.status === 'error'}
            onClick={() => onCommand(robot.id, 'return_home')}>
            Home
          </Button>
        </Group>
      )}
    </Paper>
  );
}
