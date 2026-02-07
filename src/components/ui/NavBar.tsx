
import { useThemes } from "@/globalHooks/useThemes";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Star } from "lucide-react";
import { usePortfolioData } from "@/providers/PortfolioProvider";

export default function NavBar() {
    const { watchlist } = usePortfolioData()
    const { theme, toggleTheme } = useThemes();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2 group">
                        <span className="font-bold text-2xl hidden text-foreground sm:block group-hover:text-blue-600 transition-colors">
                            CryptoTracker
                        </span>
                    </Link>

                    <div className="flex items-center gap-6 text-sm font-medium">
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                isActive
                                    ? "text-blue-600 font-bold"
                                    : "text-muted-foreground hover:text-foreground transition-colors"
                            }
                        >
                            Markets
                        </NavLink>
                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                isActive
                                    ? "text-blue-600 font-bold"
                                    : "text-muted-foreground hover:text-foreground transition-colors"
                            }
                        >
                            Portfolio
                        </NavLink>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-blue-500/10 dark:bg-blue-500/20 px-3 py-1.5 rounded-full border border-blue-500/20">
                        <Star className="w-4 h-4 text-blue-600 dark:text-blue-400 fill-current" />
                        <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">
                            {watchlist.length}
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-full hover:bg-secondary cursor-pointer transition-transform active:scale-90"
                    >
                        {theme === "light" ? (
                            <Moon className="h-5 w-5 text-slate-700" />
                        ) : (
                            <Sun className="h-5 w-5 text-yellow-400" />
                        )}
                    </Button>
                </div>
            </div>
        </nav>
    );
}