import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "../ui/button"
import { useEffect, useMemo, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronsUpDown, Check, Plus } from "lucide-react"
import { CommandList, Command, CommandInput, CommandEmpty, CommandItem, CommandGroup } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import type { Coin } from "@/types/Coin"

interface AddAssetDialogProps {
    onAdd: (asset: { id: string; amount: number; buyPrice: number }) => void;
    marketData: Coin[];
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    preselectedAssetId?: string;
}

export default function AddAssetDialog({
    onAdd,
    marketData,
    open: controlledOpen,
    onOpenChange,
    preselectedAssetId
}: AddAssetDialogProps) {

    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

    const [newCoinId, setNewCoinId] = useState<string>("");
    const [newCoinAmount, setNewCoinAmount] = useState<string>("");
    const [newCoinPrice, setNewCoinPrice] = useState<string>("");
    const [openPopover, setOpenPopover] = useState(false);
    const [emptyField, setEmptyField] = useState(false);

    const selectedCoin = useMemo(() =>
        marketData.find((c: Coin) => c.id === newCoinId),
        [marketData, newCoinId]
    );

    useEffect(() => {
        if (isOpen) {
            if (preselectedAssetId) {
                setNewCoinId(preselectedAssetId);
                const coin = marketData.find((c) => c.id === preselectedAssetId);

                if (coin) {
                    setNewCoinPrice(coin.current_price.toString());
                }
            }
        } else {
            if (controlledOpen === undefined || !controlledOpen) {
                setNewCoinId("");
                setNewCoinAmount("");
                setNewCoinPrice("");
                setEmptyField(false);
            }
        }
    }, [preselectedAssetId, isOpen, marketData, controlledOpen]);

    const handleSave = () => {
        const amount = parseFloat(newCoinAmount);
        const price = parseFloat(newCoinPrice);

        if (!newCoinId || isNaN(amount) || amount <= 0 || isNaN(price) || price <= 0) {
            setEmptyField(true);
            return;
        }

        onAdd({ id: newCoinId, amount, buyPrice: price });
        setNewCoinAmount("");
        setNewCoinPrice("");
        setNewCoinId("");
        setEmptyField(false);
        setOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            {!preselectedAssetId && (
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> Add Asset
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="bg-background text-foreground border-border sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Add Asset</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Select a coin and enter the amount you hold.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-5 py-4">
                    <div className="grid gap-2">
                        <Label className="text-sm font-medium">Coin</Label>
                        {preselectedAssetId && selectedCoin ? (
                            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                                <img src={selectedCoin.image} alt={selectedCoin.name} className="w-6 h-6" />
                                <span className="font-bold">{selectedCoin.name}</span>
                            </div>
                        ) : (
                            <Popover open={openPopover} onOpenChange={setOpenPopover}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            "w-full justify-between cursor-pointer border-border bg-card",
                                            !newCoinId && "text-muted-foreground"
                                        )}
                                    >
                                        {selectedCoin ? (
                                            <div className="flex items-center gap-2">
                                                <img src={selectedCoin.image} className="w-5 h-5 rounded-full" alt="" />
                                                <span className="font-bold">{selectedCoin.name}</span>
                                            </div>
                                        ) : "Search coin..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0 bg-popover border-border">
                                    <Command className="bg-popover">
                                        <CommandInput placeholder="Enter name..." className="h-10" />
                                        <CommandList className="max-h-60 custom-scrollbar">
                                            <CommandEmpty>No coin found.</CommandEmpty>
                                            <CommandGroup>
                                                {marketData.map((coin) => (
                                                    <CommandItem
                                                        key={coin.id}
                                                        value={coin.name}
                                                        onSelect={() => {
                                                            setNewCoinId(coin.id);
                                                            setNewCoinPrice(coin.current_price.toString());
                                                            setOpenPopover(false);
                                                        }}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", newCoinId === coin.id ? "opacity-100" : "opacity-0")} />
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <img src={coin.image} alt="" className="w-5 h-5" />
                                                            <span>{coin.name}</span>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-sm font-medium">Buy Price (per unit)</Label>
                        <div className="relative flex items-center">
                            <span className="absolute left-3 text-muted-foreground text-sm pointer-events-none">$</span>
                            <Input
                                type="text"
                                inputMode="decimal"
                                placeholder="0.00"
                                className="pl-7"
                                value={newCoinPrice}
                                onChange={(e) => setNewCoinPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-sm font-medium">Quantity</Label>
                        <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={newCoinAmount}
                            onChange={(e) => {
                                setNewCoinAmount(e.target.value.replace(/[^0-9.]/g, ''));
                                setEmptyField(false);
                            }}
                        />
                    </div>

                    {emptyField && (
                        <p className="text-sm text-destructive font-medium text-center bg-destructive/10 p-2 rounded-md">
                            Please fill in all fields correctly.
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3 mt-2">
                    <Button type="button" className="w-full py-5" onClick={handleSave}>
                        Save Asset
                    </Button>
                    <DialogClose asChild>
                        <Button type="button" variant="ghost" className="w-full border">
                            Cancel
                        </Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    )
}