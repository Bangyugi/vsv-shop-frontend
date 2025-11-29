import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  type StepIconProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  CheckCircle,
  LocalShipping,
  Inventory,
  Cancel,
  Replay,
  HourglassTopOutlined,
  FactCheckOutlined,
} from "@mui/icons-material";

import type { ApiOrderStatus } from "../../../types/order";

const steps = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];

const ColorlibStepIconRoot = styled("div")<{
  $ownerState: { completed?: boolean; active?: boolean; error?: boolean };
}>(({ theme, $ownerState }) => ({
  backgroundColor:
    theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
  zIndex: 1,
  color: "#fff",
  width: 40,
  height: 40,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...($ownerState.active && {
    backgroundColor: theme.palette.info.main,
    boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
  }),
  ...($ownerState.completed && {
    backgroundColor: theme.palette.primary.main,
  }),
  ...($ownerState.error && {
    backgroundColor: theme.palette.error.main,
  }),
}));

function ColorlibStepIcon(
  props: StepIconProps & { error?: boolean; status: ApiOrderStatus }
) {
  const { active, completed, className, error, status } = props;

  const icons: { [index: string]: React.ReactElement } = {
    1: <HourglassTopOutlined />,
    2: <FactCheckOutlined />,
    3: <Inventory />,
    4: <LocalShipping />,
    5: <CheckCircle />,
  };

  if (error) {
    return (
      <ColorlibStepIconRoot
        $ownerState={{ completed, active, error }}
        className={className}
      >
        <Cancel />
      </ColorlibStepIconRoot>
    );
  }

  if (Number(props.icon) === 5 && status === "RETURNED") {
    return (
      <ColorlibStepIconRoot
        $ownerState={{ completed: false, active: true, error: true }}
        className={className}
        sx={{ backgroundColor: "warning.main" }}
      >
        <Replay />
      </ColorlibStepIconRoot>
    );
  }

  return (
    <ColorlibStepIconRoot
      $ownerState={{ completed, active, error }}
      className={className}
    >
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

const getActiveStep = (status: ApiOrderStatus): number => {
  switch (status) {
    case "PENDING":
      return 0;
    case "CONFIRMED":
      return 1;
    case "PROCESSING":
      return 2;
    case "SHIPPED":
      return 3;
    case "DELIVERED":
      return 5;
    case "CANCELLED":
    case "RETURNED":
      return 0;
    default:
      return 0;
  }
};

const getStepLabel = (
  status: ApiOrderStatus,
  stepIndex: number
): React.ReactNode => {
  const defaultLabel = steps[stepIndex];
  if (stepIndex === 4) {
    if (status === "DELIVERED") return "Delivered";
    if (status === "CANCELLED") return "Cancelled";
    if (status === "RETURNED") return "Returned";
  }
  return defaultLabel;
};

interface ShippingTimelineProps {
  status: ApiOrderStatus;
}

const ShippingTimeline = ({ status }: ShippingTimelineProps) => {
  const activeStep = getActiveStep(status);
  const isError = status === "CANCELLED";
  const isWarning = status === "RETURNED";

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ p: { xs: 2, md: 3 }, borderRadius: "12px", mt: 4 }}
    >
      <Typography variant="h6" className="font-bold" sx={{ mb: 3 }}>
        Order Timeline
      </Typography>
      <Box sx={{ width: "100%" }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((_label, index) => {
            const label = getStepLabel(status, index);
            const stepProps: { completed?: boolean; error?: boolean } = {};

            stepProps.completed = activeStep > index;

            if (index === 4) {
              if (isError) stepProps.error = true;
              if (isWarning) stepProps.error = true;
            } else if (isError && activeStep === index) {
              stepProps.error = true;
            }

            return (
              <Step key={label as string} {...stepProps}>
                <StepLabel
                  StepIconComponent={(props) => (
                    <ColorlibStepIcon
                      {...props}
                      error={stepProps.error}
                      status={status}
                    />
                  )}
                  error={stepProps.error}
                >
                  {label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Box>
    </Paper>
  );
};

export default ShippingTimeline;
