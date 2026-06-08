import {useState} from 'react';
import {AppShell, Box} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import AppHeader from './AppHeader';
import FleetSidebar from './FleetSidebar';
import FleetMap from './FleetMap';
import MapLegend from './MapLegend';
import SystemLogs from './SystemLogs';
import {COUNTRY_NAMES} from '../data/fleet';
import {canSendCommands} from '../lib/auth';
import {useFleetSocket} from '../hooks/useFleetSocket';
import {useFleetStats} from '../hooks/useFleetStats';

export default function Dashboard({user, token, onLogout}) {
  const [opened, {toggle}] = useDisclosure();
  const [selectedId, setSelectedId] = useState(null);
  const {robots, connected, lastUpdate, logs, sendCommand} = useFleetSocket(token);
  const stats = useFleetStats(robots);
  const canCommand = canSendCommands(user.role);

  return (
    <AppShell
      className="fleet-shell"
      header={{height: 64}}
      navbar={{width: 360, breakpoint: 'md', collapsed: {mobile: !opened}}}
      padding="md">
      <AppShell.Header>
        <AppHeader
          opened={opened}
          onToggle={toggle}
          connected={connected}
          user={user}
          onLogout={onLogout}
        />
      </AppShell.Header>

      <AppShell.Navbar p="md" style={{overflowY: 'auto'}}>
        <FleetSidebar
          robots={robots}
          stats={stats}
          connected={connected}
          lastUpdate={lastUpdate}
          selectedId={selectedId}
          onSelectRobot={setSelectedId}
          onCommand={sendCommand}
          canCommand={canCommand}
        />
      </AppShell.Navbar>

      <AppShell.Main className="fleet-main">
        <MapLegend />
        <Box style={{flex: 1, minHeight: 0}}>
          <FleetMap
            robots={robots}
            selectedId={selectedId}
            onSelect={setSelectedId}
            countryNames={COUNTRY_NAMES}
          />
        </Box>
        <SystemLogs logs={logs} />
      </AppShell.Main>
    </AppShell>
  );
}
