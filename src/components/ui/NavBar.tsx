import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";

export default function NavBar() {
    const [watchlist, setWatchlist] = useLocalStorage<string[]>("watchlist", []);

    useEffect(() => {
        const handleStorageChange = () => {
            const item = window.localStorage.getItem("watchlist");
            if (item) {
                setWatchlist(JSON.parse(item));
            }
        };
        
        window.addEventListener("local-storage", handleStorageChange);
        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("local-storage", handleStorageChange);
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="font-bold text-2xl hidden text-black sm:block">CryptoTracker</span>
                    </Link>
                    <div className="flex items-center gap-4 text-sd font-medium mt-1">
                        <NavLink to="/" className={({ isActive }) => isActive ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}>
                            Markets
                        </NavLink>
                        <NavLink to="/profile" className={({ isActive }) => isActive ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}>
                            Portfolio
                        </NavLink>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                    <span className="text-blue-600 text-sm font-semibold">★ {watchlist.length}</span>
                </div>
            </div>
        </nav>
    )
}