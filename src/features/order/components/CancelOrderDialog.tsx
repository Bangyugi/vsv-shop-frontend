import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Box,
} from "@mui/material";

interface CancelOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const CancelOrderDialog = ({
  open,
  onClose,
  onSubmit,
}: CancelOrderDialogProps) => {
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    
    e.preventDefault();

    onSubmit(reason);
    setReason("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Bọc nội dung trong form để xử lý sự kiện submit chuẩn */}
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle fontWeight="bold">Confirm Order Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to cancel this order? Please provide a reason
            (optional).
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            label="Reason for cancellation"
            type="text"
            fullWidth
            variant="outlined"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={onClose} color="inherit" type="button">
            No
          </Button>
          <Button type="submit" variant="contained" color="error">
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CancelOrderDialog;
