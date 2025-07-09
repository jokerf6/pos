"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export const showSuccess = (message: string, description?: string) =>
  toast.success(message, {
    description,
    style: {
      direction: "rtl",
      backgroundColor: "#d1fae5",
      color: "#065f46",
      border: "1px solid #34d399",
    },
  });

export const showError = (message: string, description?: string) =>
  toast.error(message, {
    description,
    style: {
      direction: "rtl",
      backgroundColor: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #f87171",
    },
  });
export { Toaster };
