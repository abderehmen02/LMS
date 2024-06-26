"use client";

import * as React from "react";
import {
  Check,
  ChevronsUpDown,
  Circle,
  Plus,
  PlusSquareIcon,
  Trash   
} from "lucide-react";

import { FaSpinner  } from "react-icons/fa";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandAddInput,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ComboboxProps {
  options: { label: string; value: string }[];
  value?: string;
  onChange: (value: string) => void;
}

export const Combobox = ({ options, value, onChange }: ComboboxProps) => {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [category, setCategory] = React.useState("");

  const router = useRouter();

  const handleAddCategory = async () => {
    if (category.trim() === "") return;
    setLoading(true);
    try {
      await axios.post(`/api/categories`, { name: category });
      toast.success("Category added successfully");
      router.refresh();
      setCategory("");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };



  const handleDeleteCategory = async (id: string ) => {
    setLoading(true);
    try {
      await axios.delete(`/api/categories/${id}`);
      toast.success("Category deleted successfully");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : "Select option..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search option..." />
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  onChange(option.value === value ? "" : option.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
            <div className="w-full flex justify-between z-40" >   <span className="inline-block" >{option.label}</span> <Trash onClick={(e)=>{ e.stopPropagation() ; handleDeleteCategory(option.value) }}  className="flex text-xs cursor-pointer"  /></div>
              </CommandItem>
            ))}
          </CommandGroup>
          <div className="flex border-t items-center justify-around">
            <input
              type="text"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
              }}
              className="bg-white outline-none pl-3 placeholder:text-gray-600 text-sm placeholder:text-sm placeholder:font-thin"
              placeholder="Add category"
            />
            <button
              onClick={handleAddCategory}
              className="hover:bg-slate-100 px-3 h-full py-2"
            >
              {!loading ? (
                <Plus className="opacity-50" />
              ) : (
                <FaSpinner className="opacity-50 animate-spin m-2 text-slate-700" />
              )}
            </button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
