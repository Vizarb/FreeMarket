import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/common/ui/button";
import type { VariantProps } from "class-variance-authority";
import useCustomNavigate from "@/store/hooks/useCustomNavigate";

interface ReturnButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  to?: string;
  label?: string;
  useProtected?: boolean;
}

const ReturnButton: React.FC<ReturnButtonProps> = ({
  to,
  label = "Back",
  variant = "outline",
  size = "default",
  className,
  useProtected = false,
  ...props
}) => {
  const {
    goBack,
    goToProtectedRoute,
    goToPublicRoute,
  } = useCustomNavigate();

  const handleClick = () => {
    if (to) {
      if (useProtected) {
        goToProtectedRoute(to);
      } else {
        goToPublicRoute(to);
      }
    } else {
      goBack();
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
};

export default ReturnButton;
