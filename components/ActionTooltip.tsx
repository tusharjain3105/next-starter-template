"use client";
import { PropsWithChildren, ReactNode, useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const ActionTooltip = ({
  children,
  label,
}: PropsWithChildren<{ label: ReactNode }>) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => {
        setOpen(false);
      }, 3000);

      return () => clearTimeout(id);
    }
  }, [open]);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0} open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild role="button" onClick={() => setOpen(true)}>
          {children}
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
export default ActionTooltip;
