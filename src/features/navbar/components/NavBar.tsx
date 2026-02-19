import { useThemes } from "@/globalHooks/useThemes";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Star, Menu, X, TrendingUp, Search } from "lucide-react";
import { usePortfolioData } from "@/providers/PortfolioProvider";
import { useAuth } from "@/providers/AuthProvider";
import GlobalSearch from "./GlobalSearch";
import { useState } from "react";

export default function NavBar() {
    const { watchlist } = usePortfolioData();
    const { theme, toggleTheme } = useThemes();
    const { isAuthenticated } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const location = useLocation();

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };
    
    const isProfileActive = location.pathname === '/profile' || location.pathname === '/auth';

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link
                    to="/"
                    className="flex items-center gap-2 group shrink-0"
                    onClick={closeMobileMenu}
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity" />
                        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-1.5 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <span className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all">
                        CryptoTracker
                    </span>
                </Link>
                <div className="hidden lg:flex items-center gap-1">
                    <NavLink 
                        to="/" 
                        className={({ isActive }) =>
                            `relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive
                                    ? "text-blue-600 bg-blue-500/10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                Markets
                                {isActive && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                                )}
                            </>
                        )}
                    </NavLink>
                    
                    <Link 
                        to="/profile"
                        className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isProfileActive
                                ? "text-blue-600 bg-blue-500/10"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                        }`}
                    >
                        Portfolio
                        {isProfileActive && (
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                        )}
                    </Link>
                    
                    {isAuthenticated && (
                        <NavLink 
                            to="/watchlist" 
                            className={({ isActive }) =>
                                `relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isActive
                                        ? "text-blue-600 bg-blue-500/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    Watchlist
                                    {isActive && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    )}
                </div>
                <div className="hidden lg:flex items-center gap-3 max-w-md w-full">
                    <GlobalSearch />
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative group lg:hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-md opacity-0 group-hover:opacity-20 transition-opacity" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSearchOpen(true)}
                            className="relative rounded-full hover:bg-secondary/80 transition-all"
                        >
                            <Search className="h-5 w-5" />
                        </Button>
                    </div>
                    {isAuthenticated && (
                        <Link to="/watchlist" className="hidden sm:block">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity" />
                                <div className="relative flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 px-3 py-1.5 rounded-full border border-blue-500/20 hover:border-blue-500/40 transition-all">
                                    <Star className="w-4 h-4 text-blue-600 dark:text-blue-400 fill-current animate-pulse" />
                                    <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">
                                        {watchlist.length}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-md opacity-0 group-hover:opacity-20 transition-opacity" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="relative rounded-full hover:bg-secondary/80 transition-all hover:scale-110 active:scale-95"
                        >
                            {theme === "light" ? (
                                <Moon className="h-5 w-5 text-slate-700 transition-transform group-hover:rotate-12" />
                            ) : (
                                <Sun className="h-5 w-5 text-yellow-400 transition-transform group-hover:rotate-45" />
                            )}
                        </Button>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden rounded-full hover:bg-secondary/80 transition-all"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-5 w-5 transition-transform rotate-90" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>
            {isMobileMenuOpen && (
                <div className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-300">
                    <div className="px-4 py-4 space-y-2">
                        <NavLink
                            to="/"
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                                    isActive
                                        ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 shadow-sm"
                                        : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <div className={`w-1 h-6 rounded-full transition-all ${
                                        isActive ? "bg-gradient-to-b from-blue-600 to-purple-600" : "bg-transparent"
                                    }`} />
                                    Markets
                                </>
                            )}
                        </NavLink>
                        
                        <Link
                            to="/profile"
                            onClick={closeMobileMenu}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                                isProfileActive
                                    ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 shadow-sm"
                                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                            }`}
                        >
                            <div className={`w-1 h-6 rounded-full transition-all ${
                                isProfileActive ? "bg-gradient-to-b from-blue-600 to-purple-600" : "bg-transparent"
                            }`} />
                            Portfolio
                        </Link>
                        
                        {isAuthenticated && (
                            <NavLink
                                to="/watchlist"
                                onClick={closeMobileMenu}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                                        isActive
                                            ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 shadow-sm"
                                            : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={`w-1 h-6 rounded-full transition-all ${
                                            isActive ? "bg-gradient-to-b from-blue-600 to-purple-600" : "bg-transparent"
                                        }`} />
                                        Watchlist
                                        {watchlist.length > 0 && (
                                            <span className="ml-auto bg-blue-500/20 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                                                {watchlist.length}
                                            </span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        )}
                    </div>
                </div>
            )}
            <div className="hidden">
                <GlobalSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />
            </div>
        </nav>  
    );   
}