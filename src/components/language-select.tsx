import { useState } from "react";
import { Check, ChevronsUpDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { LANGUAGES, getLanguage } from "@/lib/languages";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSelect({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const current = getLanguage(lang);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-label="Select language"
          className={cn("justify-between gap-2", compact ? "w-auto px-3" : "w-[220px]")}
        >
          <Globe className="h-4 w-4 shrink-0 opacity-70" />
          <span className="truncate">{compact ? current.code.toUpperCase() : current.native}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="end">
        <Command>
          <CommandInput placeholder={t("settings.languageSearch")} />
          <CommandList className="max-h-72">
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {LANGUAGES.map((l) => (
                <CommandItem
                  key={l.code}
                  value={`${l.name} ${l.native} ${l.code}`}
                  onSelect={() => { setLang(l.code); setOpen(false); }}
                >
                  <Check className={cn("mr-2 h-4 w-4", lang === l.code ? "opacity-100" : "opacity-0")} />
                  <span className="flex-1 truncate">{l.native}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{l.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
