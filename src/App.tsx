import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import CoinPages from './pages/CoinPages';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path = "/coin/:id" element= {<CoinPages />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
