import {Badge, Burger, Button, Group, Text, ThemeIcon, Title} from '@mantine/core';

const ROLE_COLOR = {admin: 'violet', operator: 'cyan', viewer: 'gray'};

export default function AppHeader({opened, onToggle, connected, user, onLogout}) {
  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Group wrap="nowrap">
        <Burger opened={opened} onClick={onToggle} size="sm" hiddenFrom="md" />
        <ThemeIcon size="lg" radius="md" className="brand-icon">
          R
        </ThemeIcon>
        <div>
          <Title order={4} c="white">
            RoboDash
          </Title>
          <Text size="xs" c="dimmed">
            European Fleet Operations
          </Text>
        </div>
      </Group>
      <Group gap="sm" wrap="nowrap">
        {user && (
          <Badge size="lg" color={ROLE_COLOR[user.role] || 'gray'} variant="light">
            {user.username} · {user.role}
          </Badge>
        )}
        <Badge
          size="lg"
          color={connected ? 'green' : 'red'}
          className={connected ? 'live-badge' : undefined}>
          {connected ? 'Live' : 'Offline'}
        </Badge>
        <Button size="compact-sm" variant="subtle" onClick={onLogout}>
          Logout
        </Button>
      </Group>
    </Group>
  );
}
