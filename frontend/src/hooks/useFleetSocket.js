import {useEffect, useState} from 'react';
import {API_URL} from '../config/api';
import {initialRobots} from '../data/fleet';
import {connectSocket, disconnectSocket, getSocket} from '../lib/socket';

export function useFleetSocket(token) {
  const [robots, setRobots] = useState(initialRobots);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);

    fetch(`${API_URL}/api/logs?limit=20`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLogs(data);
      })
      .catch(() => {});

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onTelemetry = newData => {
      setRobots(prev =>
        prev.map(r => (r.id === newData.id ? {...r, ...newData} : r)),
      );
      setLastUpdate(new Date());
    };
    const onSystemLog = entry => {
      setLogs(prev => [entry, ...prev].slice(0, 30));
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('telemetry', onTelemetry);
    socket.on('system:log', onSystemLog);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('telemetry', onTelemetry);
      socket.off('system:log', onSystemLog);
      disconnectSocket();
    };
  }, [token]);

  const sendCommand = (robotId, action) => {
    getSocket()?.emit('robot:command', {robotId, action});
  };

  return {robots, connected, lastUpdate, logs, sendCommand};
}
