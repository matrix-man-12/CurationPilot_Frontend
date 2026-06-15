import { useAppState } from './context/AppContext';
import AppHeader from './components/Layout/AppHeader';
import ChatContainer from './components/Chat/ChatContainer';
import HistoryView from './components/History/HistoryView';
import './App.css';

function App() {
  const { currentView } = useAppState();

  return (
    <div className="app" id="app">
      <AppHeader />
      <main className="app-main">
        {currentView === 'chat' ? <ChatContainer /> : <HistoryView />}
      </main>
    </div>
  );
}

export default App;
