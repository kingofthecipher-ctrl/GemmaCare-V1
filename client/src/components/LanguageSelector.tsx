import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { SUPPORTED_LANGUAGES, getLanguagesByRegion, type LanguageCode } from "@/../../shared/languages";

interface LanguageSelectorProps {
  selectedLanguage: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  disabled?: boolean;
}

export function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
  disabled = false,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const languagesByRegion = getLanguagesByRegion();

  const currentLanguage = SUPPORTED_LANGUAGES[selectedLanguage];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Globe className="w-4 h-4" />
        <span>Export Language:</span>
      </div>
      <Select
        value={selectedLanguage}
        onValueChange={(value) => {
          onLanguageChange(value as LanguageCode);
          setIsOpen(false);
        }}
        disabled={disabled}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue
            placeholder="Select language"
            defaultValue={selectedLanguage}
          />
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          {Object.entries(languagesByRegion).map(([region, languages]) => (
            <div key={region}>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {region}
              </div>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex flex-col">
                    <span>{lang.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {lang.nativeName}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
      {currentLanguage && (
        <div className="text-xs text-muted-foreground">
          {currentLanguage.nativeName}
        </div>
      )}
    </div>
  );
}
