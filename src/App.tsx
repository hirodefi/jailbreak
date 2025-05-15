import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './router.tsx';
import { Web3Provider } from './context/web3Context.tsx';
import './App.css';

function App() {

  return (
    <Router>
      <Web3Provider>
        <AppRoutes />
      </Web3Provider>
    </Router>
  )
}

export default App
