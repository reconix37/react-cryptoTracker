import { useThemes } from "@/globalHooks/useThemes";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Star, Menu, X, Search } from "lucide-react";
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

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        isActive
            ? "text-blue-600 font-bold"
            : "text-muted-foreground hover:text-foreground transition-colors";

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

                <Link 
                    to="/" 
                    className="flex items-center gap-2 group shrink-0"
                    onClick={closeMobileMenu}
                >
                    <span className="font-bold text-xl sm:text-2xl text-foreground group-hover:text-blue-600 transition-colors">
                        CryptoTracker
                    </span>
                </Link>

                <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
                    <NavLink to="/" className={navLinkClass}>
                        Markets
                    </NavLink>
                    <NavLink to="/profile" className={navLinkClass}>
                        Portfolio
                    </NavLink>
                    {isAuthenticated && (
                        <NavLink to="/watchlist" className={navLinkClass}>
                            Watchlist
                        </NavLink>
                    )}
                </div>

                <div className="hidden lg:flex items-center gap-3 max-w-md w-full">
                    <GlobalSearch />
                </div>

                <div className="flex items-center gap-2 sm:gap-3">

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="lg:hidden rounded-full hover:bg-secondary"
                    >
                        <Search className="h-5 w-5" />
                    </Button>

                    {isAuthenticated && (
                        <div className="flex items-center gap-2 bg-blue-500/10 dark:bg-blue-500/20 px-2 sm:px-3 py-1.5 rounded-full border border-blue-500/20">
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 fill-current" />
                            <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-bold">
                                {watchlist.length}
                            </span>
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-full hover:bg-secondary transition-transform active:scale-90"
                    >
                        {theme === "light" ? (
                            <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700" />
                        ) : (
                            <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden rounded-full hover:bg-secondary"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>
            {isSearchOpen && (
                <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md p-4 animate-in slide-in-from-top duration-200">
                    <GlobalSearch />
                </div>
            )}

            {isMobileMenuOpen && (
                <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md animate-in slide-in-from-top duration-200">
                    <div className="px-4 py-4 space-y-3">
                        <NavLink
                            to="/"
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                                `block px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                                    isActive
                                        ? "bg-blue-500/10 text-blue-600"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                }`
                            }
                        >
                            Markets
                        </NavLink>
                        <NavLink
                            to="/profile"
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                                `block px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                                    isActive
                                        ? "bg-blue-500/10 text-blue-600"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                }`
                            }
                        >
                            Portfolio
                        </NavLink>
                        {isAuthenticated && (
                            <NavLink
                                to="/watchlist"
                                onClick={closeMobileMenu}
                                className={({ isActive }) =>
                                    `block px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                                        isActive
                                            ? "bg-blue-500/10 text-blue-600"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    }`
                                }
                            >
                                Watchlist
                            </NavLink>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}