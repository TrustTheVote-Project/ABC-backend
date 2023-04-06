import Button, { ButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import React, { ReactNode, useEffect, useState } from "react";


interface LoadingButtonProps extends ButtonProps {
  onClick: () => Promise<void>;
  children: ReactNode;
}

export default function LoadingButton ({ onClick, children, ...props }: LoadingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await onClick();
    setIsLoading(false);
  };

  useEffect(() => {
    return () => {
      setIsLoading(false)
    }
  }, [])

  return (
    <div>
      <Button onClick={handleClick}  {...props} disabled={isLoading}>
        {children}
        {isLoading && (
          <CircularProgress 
            size={30}
            color="primary"
            style={{ position: "absolute" }}
          />
        )}
      </Button>
      
    </div>
  );
};

