import ReactDOM from 'react-dom/client';
import {createTheme, MantineProvider} from '@mantine/core';
import '@mantine/core/styles.css';
import './index.css';
import App from './App';

const theme = createTheme({
  primaryColor: 'cyan',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  defaultRadius: 'md',
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#1a2234',
      '#141c2e',
      '#0c1424',
      '#060b14',
    ],
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <MantineProvider theme={theme} defaultColorScheme="dark">
    <App />
  </MantineProvider>,
);
