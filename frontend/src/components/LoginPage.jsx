import {useState} from 'react';
import {
  Alert,
  Button,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';

export default function LoginPage({onLogin}) {
  const [username, setUsername] = useState('operator');
  const [password, setPassword] = useState('op123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onLogin(username, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Paper p="xl" radius="md" className="glass-panel login-card">
        <Title order={3} mb={4}>
          RoboDash
        </Title>
        <Text size="sm" c="dimmed" mb="lg">
          Fleet Operations Login
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && (
              <Alert color="red" variant="light">
                {error}
              </Alert>
            )}
            <Button type="submit" loading={loading}>
              Sign in
            </Button>
          </Stack>
        </form>

        <Text size="xs" c="dimmed" mt="lg">
          Demo: admin/admin123 · operator/op123 · viewer/view123
        </Text>
      </Paper>
    </div>
  );
}
