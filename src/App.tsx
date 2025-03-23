import { Toaster } from 'react-hot-toast';
import './App.css';
import './styles/app.css';
import { AppProvider, useAppContext } from './context/AppContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// Error display component
const ErrorDisplay = ({ error }: { error: Error }) => {
  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '2px solid red',
      borderRadius: '5px',
      backgroundColor: '#ffeeee'
    }}>
      <h2 style={{ color: 'red' }}>Error Occurred:</h2>
      <p>{error.message}</p>
      <p>Check the console for more details.</p>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Toaster />
      <AppContent />
    </AppProvider>
  );
}

const AppContent = () => {
  try {
    const { isAuthenticated } = useAppContext();
    
    return (
      <div className="app-container">
        {isAuthenticated ? <Dashboard /> : <Login />}
      </div>
    );
  } catch (error) {
    console.error('Error in AppContent:', error);
    return <ErrorDisplay error={error instanceof Error ? error : new Error('Unknown error')} />;
  }
};

export default App;
