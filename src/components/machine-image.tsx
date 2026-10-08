import { Dumbbell } from "lucide-react";
import type { Machine } from "@/lib/machines";
import { cn } from "@/lib/utils";

interface MachineImageProps {
  machine: Machine | undefined;
  /** Shown on the fallback tile when there's no photo (e.g. "מכשיר חדש"). */
  label?: string;
  className?: string;
  imgClassName?: string;
  /** Above-the-fold images (workout hero) load eagerly. */
  eager?: boolean;
}

/**
 * Machine photo in a fixed-ratio box (callers set the aspect via className) so
 * nothing shifts while it loads. Without a catalog match it renders a brand tile.
 */
export function MachineImage({ machine, label, className, imgClassName, eager }: MachineImageProps) {
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {machine ? (
        <img
          src={machine.image}
          alt={`מכשיר ${machine.number} — ${machine.nameHe}`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className={cn("absolute inset-0 size-full object-cover", imgClassName)}
          style={machine.objectPosition ? { objectPosition: machine.objectPosition } : undefined}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 grid place-items-center bg-linear-to-br from-primary/25 via-card to-card"
        >
          <div className="flex flex-col items-center gap-2 text-primary">
            <Dumbbell className="size-8" />
            {label && <span className="text-xs font-bold text-muted-foreground">{label}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
