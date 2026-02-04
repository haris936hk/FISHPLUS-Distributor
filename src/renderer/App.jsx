```javascript
import { useEffect } from 'react';
import { MantineProvider, Card, Text, Button, Group, Stack, Badge, Title } from '@mantine/core';
import '@mantine/core/styles.css';
import useStore from './store';
import { useDatabase, useAppVersion, usePlatform } from './hooks/useDatabase';

function App() {
  const { theme, loadSettings, saveSetting, loading } = useStore();
  const version = useAppVersion();
  const platform = usePlatform();
  // Replaced direct database call with store state
  // const { data: settings, loading, refetch } = useDatabase('SELECT * FROM settings');
  // Using a simple state for demo purposes as we don't store full settings list in store yet, just the theme/lang.
  // In a real app, we would select 'settings' from the store.
  // For this demo, let's just assume we want to show the current theme setting.
  const settingsList = [
      { key: 'app_theme', value: theme }
  ];

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleThemeToggle = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    useStore.getState().setTheme(newTheme);
    await saveSetting('app_theme', newTheme);
    refetch();
  };

  return (
    <MantineProvider theme={{ colorScheme: theme }}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <Stack gap="lg">
          <div className="text-center">
            <Title order={1} className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              🚀 FISHPLUS-Distributor
            </Title>
            <Text size="lg" c="dimmed">
              Production-Ready Electron Foundation
            </Text>
          </div>

          <Group justify="center" gap="md">
            <Badge size="lg" variant="light" color="blue">
              Version {version}
            </Badge>
            <Badge size="lg" variant="light" color="green">
              {platform}
            </Badge>
            <Badge size="lg" variant="light" color="orange">
              Theme: {theme}
            </Badge>
          </Group>

          <Card shadow="md" padding="lg" radius="md" className="max-w-2xl mx-auto">
            <Stack gap="md">
              <Title order={2}>✅ Foundation Ready</Title>

              <div className="grid grid-cols-2 gap-4">
                <Card withBorder>
                  <Text fw={600}>React 18</Text>
                  <Text size="sm" c="dimmed">
                    Modern UI framework
                  </Text>
                </Card>

                <Card withBorder>
                  <Text fw={600}>Tailwind CSS</Text>
                  <Text size="sm" c="dimmed">
                    Utility-first styling
                  </Text>
                </Card>

                <Card withBorder>
                  <Text fw={600}>Mantine</Text>
                  <Text size="sm" c="dimmed">
                    Component library
                  </Text>
                </Card>

                <Card withBorder>
                  <Text fw={600}>SQLite</Text>
                  <Text size="sm" c="dimmed">
                    Local database
                  </Text>
                </Card>

                <Card withBorder>
                  <Text fw={600}>Zustand</Text>
                  <Text size="sm" c="dimmed">
                    State management
                  </Text>
                </Card>

                <Card withBorder>
                  <Text fw={600}>IPC Bridge</Text>
                  <Text size="sm" c="dimmed">
                    Secure communication
                  </Text>
                </Card>
              </div>

              <Button onClick={handleThemeToggle} fullWidth>
                Toggle Theme
              </Button>
            </Stack>
          </Card>

          <Card shadow="md" padding="lg" radius="md" className="max-w-2xl mx-auto">
            <Title order={3} mb="md">
              Database Settings
            </Title>

            {loading ? (
              <Text>Loading settings...</Text>
            ) : settings && settings.length > 0 ? (
              <Stack gap="xs">
                {settings.map((setting) => (
                  <Group key={setting.key} justify="space-between">
                    <Text fw={500}>{setting.key}</Text>
                    <Badge>{setting.value}</Badge>
                  </Group>
                ))}
              </Stack>
            ) : (
              <Text c="dimmed">No settings found</Text>
            )}
          </Card>

          <Card
            shadow="md"
            padding="lg"
            radius="md"
            className="max-w-2xl mx-auto bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900"
          >
            <Title order={3} mb="md">
              🎉 Next Steps
            </Title>
            <Stack gap="xs">
              <Text>• Build your custom components</Text>
              <Text>• Add your business logic</Text>
              <Text>• Extend the database schema</Text>
              <Text>• Create additional IPC channels</Text>
              <Text>• Write tests for your features</Text>
            </Stack>
          </Card>
        </Stack>
      </div>
    </MantineProvider>
  );
}

export default App;
