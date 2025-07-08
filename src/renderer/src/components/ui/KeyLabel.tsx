"use client";

import React from "react";
import { cn } from "../../lib/utils";

function KeyLabel({
  label,
  className,
}: {
  label: string;
  className?: string;
}): React.JSX.Element {
  return (
    <span
      className={cn(
        "text-nowrap font-semibold text-muted-foreground text-sm capitalize",
        className
      )}
    >
      {label}:
    </span>
  );
}

export default KeyLabel;
