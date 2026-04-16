import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { countryCodes, defaultCountryCode } from "@/lib/country-codes";

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function PhoneInput({ value = "", onChange, placeholder = "Phone number", className }: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  
  // Parse the phone number to extract country code and number
  const parsePhoneNumber = (phoneNumber: string) => {
    const matchingCode = countryCodes.find(({ code }) => phoneNumber.startsWith(code));
    if (matchingCode) {
      return {
        countryCode: matchingCode.code,
        number: phoneNumber.slice(matchingCode.code.length).trim(),
      };
    }
    return {
      countryCode: defaultCountryCode,
      number: phoneNumber,
    };
  };

  const { countryCode, number } = parsePhoneNumber(value);
  const [selectedCode, setSelectedCode] = useState(countryCode);
  const [phoneNumber, setPhoneNumber] = useState(number);

  const handleCountryCodeChange = (code: string) => {
    setSelectedCode(code);
    onChange?.(`${code} ${phoneNumber}`);
    setOpen(false);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/[^\d\s-]/g, ""); // Only allow digits, spaces, and hyphens
    setPhoneNumber(newNumber);
    onChange?.(`${selectedCode} ${newNumber}`);
  };

  const selectedCountry = countryCodes.find((c) => c.code === selectedCode);
  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-12 w-[150px] justify-between font-normal text-base"
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">{selectedCountry?.flag}</span>
              <span className="font-semibold">{selectedCode}</span>
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search country..." className="h-10 text-base" />
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup className="max-h-[320px] overflow-auto">
              {countryCodes.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.country} ${country.code}`}
                  onSelect={() => handleCountryCodeChange(country.code)}
                  className="cursor-pointer py-3 text-base"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCode === country.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="text-xl mr-3">{country.flag}</span>
                  <span className="flex-1 font-medium">{country.country}</span>
                  <span className="font-semibold text-sm text-muted-foreground">{country.code}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Input
        type="tel"
        placeholder={placeholder}
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        className="flex-1 h-12 text-base"
      />
    </div>
  );
}
