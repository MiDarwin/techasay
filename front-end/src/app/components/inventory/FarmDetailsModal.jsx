import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Divider,
  Chip,
  useTheme,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import MemoryIcon from "@mui/icons-material/Memory";
import KeyIcon from "@mui/icons-material/VpnKey";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import BarcodeIcon from "@mui/icons-material/QrCode2";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import { alpha } from "@mui/material/styles";

/**
 * FarmDetailsModal – "Çiftlik" alt-şube envanterini modern bir görünümle gösterir.
 *  – Renkli sol şerit, hafif gölge/köşe yumuşatma, sensöre özel ikonlar
 *  – Her sensör bloğu için farklı accent rengi
 */
export default function FarmDetailsModal({ open, onClose, inv }) {
  const theme = useTheme();
  if (!inv) return null;

  /* Sensör adına göre grupla */
  const grouped = React.useMemo(() => {
    const g = {};
    Object.entries(inv.details || {}).forEach(([k, v]) => {
      const [sensor, field] = k.split("_", 2);
      if (!g[sensor]) g[sensor] = {};
      g[sensor][field] = v;
    });
    return g;
  }, [inv.details]);

  /* Accent renk paleti (döngü) */
  const accents = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
  ];

  /* Alan -> ikon */
  const fieldIcon = (field) => {
    const f = field.toLowerCase();
    if (f.includes("key")) return <KeyIcon fontSize="small" />;
    if (f.includes("eui")) return <FingerprintIcon fontSize="small" />;
    if (f.includes("sensor")) return <DevicesOtherIcon fontSize="small" />;
    if (f.includes("pcb")) return <MemoryIcon fontSize="small" />;
    return <BarcodeIcon fontSize="small" />;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, boxShadow: 6 } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", pr: 6 }}>
        <Chip
          label="Sensör Detayları"
          color="primary"
          size="small"
          sx={{ mr: 1 }}
        />
        {inv.branch_name}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        {Object.entries(grouped).map(([sensor, fields], idx) => {
          const accent = accents[idx % accents.length];
          const sensorId =
            fields["Sensor ID"] || fields["sensor_id"] || fields["sensorId"];

          return (
            <Paper
              key={sensor}
              elevation={1}
              sx={{
                mb: 2,
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: alpha(accent, 0.04), // hafif tint
              }}
            >
              <Accordion disableGutters square elevation={0}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    "& .MuiAccordionSummary-content": { alignItems: "center" },
                    px: 2,
                    backgroundColor: "#EDF2F7",
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 28,
                      bgcolor: accent,
                      borderRadius: 1,
                      mr: 1.5,
                    }}
                  />
                  <Typography fontWeight={600}>{sensor}</Typography>
                  {sensorId && (
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ ml: 1, color: "text.secondary" }}
                    >
                      Sensör ID: {sensorId}
                    </Typography>
                  )}
                </AccordionSummary>

                <AccordionDetails
                  sx={{ pt: 0, pb: 1, px: 1, backgroundColor: "#EDF2F7" }}
                >
                  <List dense disablePadding>
                    {Object.entries(fields).map(([field, val], i) => (
                      <React.Fragment key={field}>
                        <ListItem sx={{ pl: 4, pr: 2 }}>
                          <ListItemIcon sx={{ minWidth: 28, color: accent }}>
                            {fieldIcon(field)}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight={500}>
                                {field}:
                              </Typography>
                            }
                            secondary={val}
                            secondaryTypographyProps={{ variant: "body2" }}
                          />
                        </ListItem>
                        {i !== Object.keys(fields).length - 1 && (
                          <Divider
                            component="li"
                            variant="inset"
                            sx={{ borderColor: alpha(accent, 0.2) }}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Paper>
          );
        })}
      </DialogContent>
    </Dialog>
  );
}
