import { useState, useEffect } from 'react'
import './App.css'
import './styles/app.css'
import { AppProvider, useAppContext } from './context/AppContext'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

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

function App() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Initialize app and catch any errors
    try {
      console.log('App initialized');
    } catch (err) {
      console.error('Error during app initialization:', err);
      setError(err instanceof Error ? err : new Error('Unknown error during initialization'));
    }
  }, []);

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  try {
    return (
      <AppProvider>
        <AppContent />
      </AppProvider>
    );
  } catch (err) {
    console.error('Error rendering App:', err);
    return <ErrorDisplay error={err instanceof Error ? err : new Error('Unknown error rendering App')} />;
  }
}

export default App
