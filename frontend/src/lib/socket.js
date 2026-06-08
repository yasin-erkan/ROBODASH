import io from 'socket.io-client';
import {API_URL} from '../config/api';

let socket = null;

export const connectSocket = token => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(API_URL, {
    query: {token},
    transports: ['websocket'],
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
