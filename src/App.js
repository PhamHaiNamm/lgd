
import { Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './HomePage';

function App() {
  return (
    <div className="App">


      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>

      <p> Thị Kitty là 1 con gà</p>
    </div>
  );
}

export default App;
