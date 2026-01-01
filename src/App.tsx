import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Markets from "./pages/Markets";
import CoinPages from './pages/CoinPages';
import NavBar from './components/ui/NavBar';

function App() {

  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Markets />} />
        <Route path="/coin/:id" element={<CoinPages />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
