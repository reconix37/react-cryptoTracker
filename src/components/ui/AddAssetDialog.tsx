import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "./button"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronsUpDown } from "lucide-react"
import { CommandList, Command, CommandInput, CommandEmpty, CommandItem, CommandGroup } from "@/components/ui/command"
import type { Coin } from "@/types/Coin"

interface AddAssetDialogProps {
    onAdd: (newAsset: { id: string; amount: number }) => void;
    marketData: Coin[]
}

export default function AddAssetDialog({ onAdd, marketData }: AddAssetDialogProps) {

    const [newCoinId, setNewCoinId] = useState<string>("")
    const [newCoinAmount, setNewCoinAmount] = useState<number>(0)
    const [emptyField, setEmptyField] = useState<boolean>(false)
    const [open, setOpen] = useState(false);
    const [openPopover, setOpenPopover] = useState(false);

    const handleSave = () => {
        if (!newCoinId || !newCoinAmount) {
            setEmptyField(true)
            return
        }

        onAdd({ id: newCoinId, amount: newCoinAmount })
        setNewCoinAmount(0)
        setNewCoinId("")
        setEmptyField(false)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="text-white hover:text-blue scale-105" >+ Add Assets</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add your Assets</DialogTitle>
                    <DialogDescription>
                        Here you can add a coin to your portfolio as well as its quantity.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label>Coin Name: </Label>
                        <Input value={newCoinId} onChange={(e) => {
                            setNewCoinId((e.target.value).toLowerCase()); setEmptyField(false);
                        }} />
                        <Popover open={openPopover} onOpenChange={setOpenPopover}>
                            <PopoverTrigger asChild>
                                <Button variant="default" className="w-full justify-between">
                                    {newCoinId ? marketData.find(c => c.id === newCoinId)?.name : "Select Coin..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-100 p-0">
                                <Command>
                                    <CommandInput placeholder="Search coin..." />
                                    <CommandList>
                                        <CommandEmpty>No coin found.</CommandEmpty>
                                        <CommandGroup>
                                            {marketData.map((coin) => (
                                                <CommandItem
                                                    key={coin.id}
                                                    value={coin.id}
                                                    onSelect={(currentValue) => {
                                                        setNewCoinId(currentValue);
                                                        setOpenPopover(false);
                                                    }}
                                                >
                                                    <img src={coin.image} alt={coin.name} className="w-4 h-4 mr-2" />
                                                    {coin.name}
                                                    <span className="ml-auto text-slate-400 text-xs">${coin.current_price}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid gap-3">
                        <Label >Amount</Label>
                        <Input type="number"
                            value={newCoinAmount} onChange={(e) => {
                                setNewCoinAmount(parseFloat(e.target.value)); setEmptyField(false)
                            }} />
                    </div>
                    {emptyField && <p className="text-sm text-red-500 text-center">Please fill in all fields.</p>}
                    <Button type="button" className="text-white" onClick={handleSave}>Save</Button>
                </div>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" className="text-white w-full">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}