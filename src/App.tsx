import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Markets from "./pages/Markets";
import CoinPages from './pages/CoinPages';
import NavBar from './components/ui/NavBar';
import Profile from './pages/Profile';
import { Toaster } from 'sonner';
import CryptoProvider from './contexts/CryptoProvider';
import AuthProvider from './contexts/AuthProvider';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import Auth from './pages/Auth';

function App() {

  return (
    <AuthProvider>
      <CryptoProvider>
        <BrowserRouter>
          <Toaster position="top-center" richColors closeButton />
          <NavBar />
          <Routes>
            <Route path='/auth' element={<Auth />} />
            <Route path="/" element={<Markets />} />
            <Route path="/coin/:id" element={<CoinPages />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CryptoProvider>
    </AuthProvider>
  )
}
export default App
