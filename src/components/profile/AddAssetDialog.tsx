import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "../ui/button"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronsUpDown, Check, Plus } from "lucide-react"
import { CommandList, Command, CommandInput, CommandEmpty, CommandItem, CommandGroup } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import type { Coin } from "@/types/Coin"

interface AddAssetDialogProps {
    onAdd: (newAsset: { id: string; amount: number; buyPrice: number; }) => void;
    marketData: Coin[]
}

export default function AddAssetDialog({ onAdd, marketData }: AddAssetDialogProps) {
    const [newCoinId, setNewCoinId] = useState<string>("")
    const [newCoinAmount, setNewCoinAmount] = useState<string>("0")
    const [emptyField, setEmptyField] = useState<boolean>(false)
    const [open, setOpen] = useState(false);
    const [openPopover, setOpenPopover] = useState(false);
    const [newCoinPrice, setNewCoinPrice] = useState<string>("0")

    const handleSave = () => {
        const amount = parseFloat(newCoinAmount);
        const price = parseFloat(newCoinPrice);

        if (!newCoinId || isNaN(amount) || amount <= 0 || isNaN(price) || price <= 0) {
            setEmptyField(true);
            return;
        }

        onAdd({ id: newCoinId, amount: amount, buyPrice: price });

        setNewCoinAmount("");
        setNewCoinPrice("");
        setNewCoinId("");
        setEmptyField(false);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="font-bold shadow-sm transition-transform active:scale-95 border-border hover:bg-accent text-foreground cursor-pointer"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Assets
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-background text-foreground border-border sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        Add Asset
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Choose a coin and enter the amount you hold.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 py-4">
                    <div className="grid gap-2">
                        <Label className="text-sm font-medium">
                            Select Coin
                        </Label>
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
                                    {newCoinId ? (
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={marketData.find(c => c.id === newCoinId)?.image}
                                                className="w-5 h-5 rounded-full"
                                                alt=""
                                            />
                                            {marketData.find(c => c.id === newCoinId)?.name}
                                        </div>
                                    ) : (
                                        "Search coin..."
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-75 p-0 bg-popover border-border">
                                <Command className="bg-popover">
                                    <CommandInput
                                        placeholder="Search..."
                                        className="h-10 border-none focus:ring-0"
                                    />
                                    <CommandList className="max-h-62.5 custom-scrollbar">
                                        <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                                            No coin found.
                                        </CommandEmpty>
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
                                                    className="cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            newCoinId === coin.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <img src={coin.image} alt={coin.name} className="w-5 h-5" />
                                                        <span>{coin.name}</span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-sm font-medium text-foreground">
                            Buy Price (per unit)
                        </Label>
                        <div className="relative flex items-center">
                            <span className="absolute left-3 text-muted-foreground text-sm pointer-events-none">
                                $
                            </span>
                            <Input
                                type="text"
                                inputMode="decimal"
                                placeholder="0.00"
                                className="pl-7 bg-card border-border w-full"
                                value={newCoinPrice}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9.]/g, '');
                                    setNewCoinPrice(val);
                                }}
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                        Current market price loaded automatically.
                    </p>
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-sm font-medium">
                            Quantity
                        </Label>
                        <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            className="bg-card border-border text-foreground"
                            value={newCoinAmount}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                setNewCoinAmount(val);
                                setEmptyField(false);
                            }}
                        />
                    </div>
                    {emptyField && (
                        <p className="text-sm text-destructive font-medium text-center bg-destructive/10 p-2 rounded-md transition-all">
                            Please fill in all fields.
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3 mt-2">
                    <Button
                        type="button"
                        className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold py-5 cursor-pointer"
                        onClick={handleSave}
                    >
                        Save Asset
                    </Button>
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full border border-border text-muted-foreground hover:bg-accent cursor-pointer"
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    )
}