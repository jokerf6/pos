"use client";

import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React from "react";
import { cn } from "../../lib/utils";

interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  thumbClassName?: string;
  className?: string;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ thumbClassName, className, ...props }, ref) => {
  const isRTL = true;

  return (
    <SwitchPrimitives.Root
      className={cn(
        `peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center 
        rounded-full border-2 border-transparent shadow-sm transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950
        focus-visible:ring-offset-2 focus-visible:ring-offset-white 
        disabled:cursor-not-allowed disabled:opacity-50
        data-[state=checked]:bg-primary data-[state=unchecked]:bg-neutral-200
        dark:focus-visible:ring-neutral-300 dark:focus-visible:ring-offset-neutral-950
        dark:data-[state=checked]:bg-success/80 dark:data-[state=unchecked]:bg-neutral-800`,
        className
      )}
      {...props}
      ref={ref}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          `pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0
          transition-transform`,
          isRTL
            ? "data-[state=checked]:translate-x-[-16px] data-[state=unchecked]:translate-x-0"
            : "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
          "dark:bg-neutral-950 data-[state=checked]:bg-Red",
          thumbClassName
        )}
      />
    </SwitchPrimitives.Root>
  );
});

Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
