import {Badge, Box, Group, Paper, Text} from '@mantine/core';
import {LOG_COLOR} from '../constants/status';

export default function SystemLogs({logs}) {
  return (
    <Paper p="sm" mt="sm" radius="md" className="glass-panel activity-log">
      <Group justify="space-between" mb="xs">
        <Text size="sm" fw={600}>
          System Logs
        </Text>
        <Text size="xs" c="dimmed">
          Saved to MySQL · /api/logs
        </Text>
      </Group>
      <Box style={{maxHeight: 120, overflowY: 'auto'}}>
        {logs.length === 0 ? (
          <Text size="xs" c="dimmed">
            No logs yet. Start backend.
          </Text>
        ) : (
          logs.map((log, i) => (
            <Group key={log.id || `${log.created_at}-${i}`} gap="xs" mb={4} wrap="nowrap">
              <Badge size="xs" color={LOG_COLOR[log.level] || 'gray'} variant="light">
                {log.level}
              </Badge>
              <Text size="xs" c="dimmed" style={{minWidth: 52}}>
                {new Date(log.created_at).toLocaleTimeString('en-US')}
              </Text>
              <Text size="xs" truncate>
                [{log.source}] {log.message}
              </Text>
            </Group>
          ))
        )}
      </Box>
    </Paper>
  );
}
