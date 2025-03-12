import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import Draw from './Draw';
import Login from './Login';
import { SocketProvider } from "./SocketContext";
function App() {
  return (
    <SocketProvider>
    <Router>  
      <Routes>  
        <Route path="/" element={<Login />} /> 
        <Route path="/draw" element={<Draw />} />  
       
      </Routes>
    </Router>
    </SocketProvider>
  );
}

export default App;
