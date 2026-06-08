import {Paper, Text} from '@mantine/core';

export default function StatCard({label, value, color}) {
  return (
    <Paper p="sm" radius="md" className="glass-panel stat-card">
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text size="xl" fw={700} c={color}>
        {value}
      </Text>
    </Paper>
  );
}
