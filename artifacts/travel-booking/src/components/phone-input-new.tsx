import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { countryCodes, defaultCountryCode } from "@/lib/country-codes";

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = "", onChange, placeholder = "Phone number", className }, ref) => {
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

    const handleCountryCodeChange = (code: string) => {
      onChange?.(`${code} ${number}`);
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newNumber = e.target.value.replace(/[^\d\s-]/g, ""); // Only allow digits, spaces, and hyphens
      onChange?.(`${countryCode} ${newNumber}`);
    };

    const selectedCountry = countryCodes.find((c) => c.code === countryCode);

    return (
      <div className={cn("flex gap-2", className)}>
        <Select value={countryCode} onValueChange={handleCountryCodeChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue>
              <span className="flex items-center gap-2">
                <span className="text-lg">{selectedCountry?.flag}</span>
                <span className="font-mono text-sm">{countryCode}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {countryCodes.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span className="text-lg">{country.flag}</span>
                  <span>{country.country}</span>
                  <span className="font-mono text-xs text-muted-foreground ml-auto">
                    {country.code}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          ref={ref}
          type="tel"
          placeholder={placeholder}
          value={number}
          onChange={handlePhoneNumberChange}
          className="flex-1"
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";
