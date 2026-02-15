import { usePortfolio } from "@/features/portfolio/hooks/usePortfolio";
import AnalyticsCards from "@/features/portfolio/components/AnalyticsCards";
import AssetsList from "@/features/portfolio/components/AssetsList";
import PortfolioHeader from "@/features/portfolio/components/PortfolioHeader";
import PortfolioOverview from "@/features/portfolio/components/PortfolioOverview";

export default function Profile() {
  const {
    assets,
    isLoading,
    addAsset,
    stats,
    deleteAsset,
    searchQuery,
    setSearchQuery,
    transactions,
    share,
    coins,
    marketList,
    lastUpdated,
    logout,
    user,
  } = usePortfolio();


  const formatted = new Date(lastUpdated ?? Date.now()).toLocaleTimeString();

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 bg-background text-foreground min-h-screen">

      <PortfolioHeader
        user={user}
        logout={logout}
        lastUpdated={lastUpdated}
        addAsset={addAsset}
        isLoading={isLoading}
        marketData={marketList}
        formatted={formatted}
      />

      <PortfolioOverview
        coins={coins}
        stats={stats}
        transactions={transactions}
      />

      <AnalyticsCards
        stats={stats}
        assets={assets}
      />

      <AssetsList
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isLoading={isLoading}
        assets={assets}
        share={share}
        deleteAsset={deleteAsset}
      />
    </div>
  );
}