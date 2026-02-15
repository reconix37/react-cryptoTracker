import { useCrypto } from "@/providers/CryptoProvider";
import { useEffect } from "react";

/**
 * Debug component to verify data loading
 */
export function DebugDataLoader() {
    const { marketList, coins, isLoading, error, lastUpdated, refreshData } = useCrypto();

    useEffect(() => {
        console.log('[DebugDataLoader] Component mounted');
        console.log('[DebugDataLoader] State:', {
            marketListLength: marketList.length,
            coinsCount: Object.keys(coins).length,
            isLoading,
            error,
            lastUpdated: lastUpdated ? new Date(lastUpdated).toISOString() : 'null',
        });
    }, [marketList, coins, isLoading, error, lastUpdated]);

    const handleManualRefresh = () => {
        console.log('[DebugDataLoader] Manual refresh triggered');
        refreshData(true);
    };

    return (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-md z-50">
            <h3 className="font-bold mb-2">Debug Info</h3>
            <div className="space-y-1">
                <div>Market List: {marketList.length} coins</div>
                <div>Coins Object: {Object.keys(coins).length} entries</div>
                <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
                <div>Error: {error || 'None'}</div>
                <div>Last Updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}</div>
            </div>
            <button 
                onClick={handleManualRefresh}
                className="mt-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white w-full"
            >
                Force Refresh
            </button>
        </div>
    );
}