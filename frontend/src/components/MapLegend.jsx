import {Badge, Group, Paper, Text} from '@mantine/core';
import {LEGEND} from '../constants/status';

export default function MapLegend() {
  return (
    <Paper p="sm" mb="sm" radius="md" className="legend-bar">
      <Group gap="xs" wrap="wrap">
        <Text size="sm" fw={600}>
          Map legend:
        </Text>
        {LEGEND.map(item => (
          <Badge key={item.label} color={item.color} variant="light">
            {item.label}
          </Badge>
        ))}
      </Group>
    </Paper>
  );
}
