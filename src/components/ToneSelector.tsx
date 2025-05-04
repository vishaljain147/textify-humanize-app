
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useResponsiveUI } from "@/hooks/useResponsiveUI";

type ToneSelectorProps = {
  selectedTone: string;
  onChange: (value: string) => void;
};

export default function ToneSelector({ selectedTone, onChange }: ToneSelectorProps) {
  const { isMobile } = useResponsiveUI();
  
  const tones = [
    { value: "formal", label: "Formal" },
    { value: "friendly", label: "Friendly" },
    { value: "concise", label: "Concise" },
    { value: "persuasive", label: "Persuasive" },
    { value: "creative", label: "Creative" }
  ];

  return (
    <div className="space-y-3">
      <Label className="text-base">Select Tone</Label>
      <RadioGroup 
        value={selectedTone} 
        onValueChange={onChange}
        className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-wrap gap-2'}`}
      >
        {tones.map((tone) => (
          <div key={tone.value} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={tone.value} 
              id={`tone-${tone.value}`} 
              className="peer sr-only" 
            />
            <Label
              htmlFor={`tone-${tone.value}`}
              className="flex cursor-pointer items-center rounded-md border-2 border-muted px-3 py-2 text-sm peer-data-[state=checked]:border-primary hover:bg-accent"
            >
              {tone.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
