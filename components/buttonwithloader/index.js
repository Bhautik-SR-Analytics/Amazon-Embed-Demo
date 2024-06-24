import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ButtonWithLoader({
    type = "submit",
    name,
    size = "default",
    variant = "default",
    buttonText,
    onClick,
    className,
    loader,
    icon,
}) {
    return (
        <Button
            type={type}
            name={name}
            size={size}
            variant={variant}
            className={cn("relative", className)}
            onClick={onClick}
            disabled={loader}>
            {loader && (
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                </span>
            )}
            <span className={loader ? "opacity-0" : undefined}>{icon}</span>
            <span className={loader ? "opacity-0" : undefined}>{buttonText}</span>
        </Button>
    );
}
