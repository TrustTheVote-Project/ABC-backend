import React, { ReactNode, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { styled } from "@mui/material/styles";
import LoadingButton from "./LoadingButton";


interface ConfirmationDialogProps {
  title?: string;
  open: boolean;
  children: ReactNode;
  btnCancelText?: string;
  btnConfirmText?: string;
  onClose: (confirmed: boolean) => void;
}

export default function ConfirmationDialog({
  title,
  children,
  open,
  btnCancelText = 'Cancel',
  btnConfirmText = 'Confirm',
  onClose,
}: ConfirmationDialogProps) {

  const handleConfirm = async () => {
    await onClose(true);
  };

  const handleCancel = async () => {
    onClose(false);
  };

  const ActionButton = styled(LoadingButton) `
    width: auto;
    border-radius: 5px;
    margin: 0 5px 10px 5px;
  `

  return (
    <Dialog maxWidth="md" open={open} onClose={handleCancel} >
      <DialogTitle variant="h3">
        {title} 
      </DialogTitle>
      <DialogContent>
        {children}
      </DialogContent>
      <DialogActions>
        <ActionButton onClick={handleCancel} variant="outlined">
          {btnCancelText}
        </ActionButton>
        <ActionButton onClick={handleConfirm} autoFocus>
          {btnConfirmText}
        </ActionButton>
      </DialogActions>
    </Dialog>
  );
};
