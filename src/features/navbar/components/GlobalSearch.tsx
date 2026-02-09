import { useEffect, useMemo, useState } from "react"
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, } from "@/components/ui/command"
import { useCrypto } from "@/providers/CryptoProvider"
import { useNavigate } from "react-router-dom"
import type { SearchIndex } from "@/types/Coin"
import { Button } from "@/components/ui/button"
import { Loader2, Search } from "lucide-react"

export default function GlobalSearch() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")

    const { searchIndex, isSearchIndexLoading } = useCrypto()
    const navigate = useNavigate()

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault()
                setOpen((prev) => !prev)
            }
        }

        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [])

    const results = useMemo(() => {
        if (!query) return searchIndex.slice(0, 10)

        const q = query.toLowerCase()

        return searchIndex.filter(
            (coin) =>
                coin.name.toLowerCase().includes(q) ||
                coin.symbol.toLowerCase().includes(q)
        )
    }, [searchIndex, query])

    const handleSelect = (coin: SearchIndex) => {
        setOpen(false)
        setQuery("")
        navigate(`/coin/${coin.id}`)
    }

    return (
        <div className="flex flex-col gap-4">
            <Button
                variant="outline"
                onClick={() => setOpen(true)}
                className="hidden md:flex w-full max-w-md items-center justify-between bg-muted/50 border-input text-muted-foreground hover:text-foreground hover:bg-muted"
            >
                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <span>Search coins...</span>
                </div>

                <kbd className="pointer-events-none rounded-md border bg-background px-2 py-0.5 text-xs font-mono text-muted-foreground">
                    ⌘ K
                </kbd>
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(true)}
                className="flex md:hidden text-muted-foreground hover:text-foreground"
            >
                <Search className="h-5 w-5" />
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Search coins…"
                    value={query}
                    onValueChange={setQuery}
                />

                <CommandList>
                    {isSearchIndexLoading && (
                        <div className="flex items-center justify-center py-6 text-muted-foreground gap-2 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading search index…
                        </div>
                    )}

                    {!isSearchIndexLoading && results.length === 0 && (
                        <CommandEmpty>No coins found.</CommandEmpty>
                    )}


                    {!isSearchIndexLoading && results.length > 0 && (
                        <CommandGroup heading="Coins">
                            {results.map((coin) => (
                                <CommandItem
                                    key={coin.id}
                                    onSelect={() => handleSelect(coin)}
                                    className="flex items-center gap-3 cursor-pointer"
                                >
                                    <img
                                        src={coin.image}
                                        alt={coin.name}
                                        className="w-5 h-5 rounded-full"
                                    />
                                    <span className="font-medium">{coin.name}</span>
                                    <span className="ml-auto text-xs text-muted-foreground uppercase">
                                        {coin.symbol}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </div>
    )
}
