import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from "@mui/material";

interface RequestRefundDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const RequestRefundDialog = ({
  open,
  onClose,
  onSubmit,
}: RequestRefundDialogProps) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (!reason) {
      setError(true);
      return;
    }
    onSubmit(reason);
    setReason("");
    setError(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight="bold">Request Refund / Return</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Please provide a detailed reason for your return request. Our support
          team will contact you shortly.
        </DialogContentText>
        <TextField
          autoFocus
          required
          margin="dense"
          id="reason"
          label="Reason for return"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (e.target.value) setError(false);
          }}
          error={error}
          helperText={error ? "Reason is required." : ""}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="warning">
          Send Request
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestRefundDialog;
