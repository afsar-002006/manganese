import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DICTIONARY: Record<string, string> = {
  Prospectivity:
    "Modelled spatial probability or favourability of manganese mineralization based on multi-source AI fusion.",
  XAI: "Explainable Artificial Intelligence: Transparent model reasoning exposing exact feature contribution weights.",
  SHAP: "Shapley Additive exPlanations: Game-theoretic approach to measure positive or negative contribution of each feature.",
  Borehole: "Subsurface vertical drillhole sample providing lithology and manganese grade assay evidence.",
  Confidence:
    "Statistical uncertainty metric calculated from data completeness and geological variability.",
  "Geological Evidence":
    "Bedrock lithology, structural faults, and hydrothermal alteration signatures.",
};

export function MiningTooltip({
  term,
  children,
}: {
  term: keyof typeof DICTIONARY | string;
  children?: React.ReactNode;
}) {
  const text = DICTIONARY[term] || "Technical parameter used in decision support model.";

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-help border-b border-dashed border-muted-foreground/50 hover:border-primary">
            {children || term}
            <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-primary" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs bg-popover text-popover-foreground border border-border p-2.5 shadow-md">
          <p className="font-semibold text-primary mb-0.5">{term}</p>
          <p className="text-muted-foreground text-[11px] leading-relaxed">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
