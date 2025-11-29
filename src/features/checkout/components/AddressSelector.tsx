import {
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
} from "@mui/material";
import type { AddressDetails } from "../../../types";

interface AddressSelectorProps {
  savedAddresses: AddressDetails[];
  selectedAddressId: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddressSelector = ({
  savedAddresses,
  selectedAddressId,
  onChange,
}: AddressSelectorProps) => {
  return (
    <RadioGroup name="addressId" value={selectedAddressId} onChange={onChange}>
      {savedAddresses.map((address) => (
        <FormControlLabel
          key={address.id}
          value={address.id.toString()}
          control={<Radio />}
          label={
            <Box>
              <Typography className="font-semibold">{address.label}</Typography>
              <Typography variant="body2" color="text.secondary">
                {address.fullName} | {address.phone}
              </Typography>
            </Box>
          }
          sx={{
            mb: 1,
            mx: 0,
            p: 1.5,
            border: "1px solid",
            borderColor:
              selectedAddressId === address.id.toString()
                ? "primary.main"
                : "divider",
            borderRadius: "8px",
            "&:hover": {
              borderColor: "primary.light",
            },
          }}
        />
      ))}
      {/* Option to add new address */}
      <FormControlLabel
        value="new"
        control={<Radio />}
        label={
          <Typography className="font-semibold">Add a new address</Typography>
        }
        sx={{
          mb: 1,
          mx: 0,
          p: 1.5,
          border: "1px dashed",
          borderColor: selectedAddressId === "new" ? "primary.main" : "divider",
          borderRadius: "8px",
        }}
      />
    </RadioGroup>
  );
};

export default AddressSelector;
