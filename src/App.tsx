import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Markets from "./pages/Markets";
import CoinPages from './pages/CoinPages';
import NavBar from './components/ui/NavBar';
import Profile from './pages/Profile';
import { Toaster } from 'sonner';
import CryptoProvider from './contexts/CryptoProvider';
import AuthProvider from './contexts/AuthProvider';

function App() {

  return (
    <AuthProvider>
      <CryptoProvider>
        <BrowserRouter>
          <Toaster position="top-center" richColors closeButton />
          <NavBar />
          <Routes>
            <Route path="/" element={<Markets />} />
            <Route path="/coin/:id" element={<CoinPages />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </BrowserRouter>
      </CryptoProvider>
    </AuthProvider>
  )
}
export default App
