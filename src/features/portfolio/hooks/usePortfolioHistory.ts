import { useAuth } from "@/providers/AuthProvider";
import { db } from "@/services/firebase";
import type { PortfolioHistoryPoint } from "@/types/PortfolioHistoryPoint";
import { collection, limit, onSnapshot, orderBy, query, Timestamp, where } from "firebase/firestore";
import { useEffect, useState } from "react";

interface UsePortfolioHistoryOptions {
    days?: 7 | 30 | 90 | 365;
}

export function usePortfolioHistory(options: UsePortfolioHistoryOptions = { days: 7 }) {
    const { days = 7 } = options;
    const { user, isAuthenticated } = useAuth()
    const [history, setHistory] = useState<PortfolioHistoryPoint[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user || !isAuthenticated) {
            setHistory([])
            setIsLoading(false)
            return;
        }

        setIsLoading(true)
        setError(null)

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days)
        startDate.setHours(0, 0, 0, 0);

        const q = query(
            collection(db, "portfolio_history"),
            where("userId", "==", user.id),
            where("timestamp", ">=", Timestamp.fromDate(startDate)),
            orderBy("timestamp", "asc"),
            limit(days)
        )

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const historyData = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        date: data.timestamp.toDate(),
                        balance: data.totalBalance || 0,
                        timestamp: data.timestamp,
                    };
                });

                setHistory(historyData);
                setIsLoading(false);
            },
            (err) => {
                console.error("Error loading portfolio history:", err);
                setError(err.message);
                setIsLoading(false);
            }
        )
        return () => unsubscribe();

    }, [user, isAuthenticated])

    return {
        history,
        isLoading,
        error,
    };
}