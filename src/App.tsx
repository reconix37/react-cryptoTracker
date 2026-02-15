import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Markets from "./pages/Markets";
import CoinPages from './pages/CoinPages';
import NavBar from './features/navbar/components/NavBar';
import Profile from './pages/Profile';
import { Toaster } from 'sonner';
import CryptoProvider from './providers/CryptoProvider';
import AuthProvider from './providers/AuthProvider';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import Auth from './pages/Auth';
import PortfolioProvider from './providers/PortfolioProvider';
import WatchList from './pages/Watchlist';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CryptoProvider>
          <PortfolioProvider>
            <Toaster position="top-center" richColors closeButton />
            <NavBar />
            <Routes>
              <Route path='/auth' element={<Auth />} />
              <Route path="/" element={<Markets />} />
              <Route path="/coin/:id" element={<CoinPages />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/watchlist" element={<WatchList />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              <Route path='*' element={<NotFound />}/>
            </Routes>
          </PortfolioProvider>
        </CryptoProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
export default App