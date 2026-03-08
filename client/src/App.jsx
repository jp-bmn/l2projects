import './index.css';
import { useActivityFeed } from './hooks/useActivityFeed';
import AppShell from './components/layout/AppShell';

function App() {
  useActivityFeed();

  return <AppShell />;
}

export default App;
