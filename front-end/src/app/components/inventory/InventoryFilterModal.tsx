// src/app/components/inventory/InventoryFilterModal.tsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  FormGroup,
  Checkbox,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  ListItemIcon,
  Typography,
} from "@mui/material";
import {
  Thermostat as ThermostatIcon,
  Opacity as OpacityIcon,
  Waves as WavesIcon,
  Grain as GrainIcon,
} from "@mui/icons-material";
import MemoryIcon from "@mui/icons-material/Memory";
import KeyIcon from "@mui/icons-material/VpnKey";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import BarcodeIcon from "@mui/icons-material/QrCode2";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import { getInventoryFieldsByCompanyJust } from "@/app/utils/api";

interface InventoryFilterModalProps {
  open: boolean;
  onClose: () => void;
  companyId: number | string;
}

const ICON_OPTIONS = [
  { value: "Thermostat", label: "Thermostat", Icon: ThermostatIcon },
  { value: "Opacity", label: "Humidity", Icon: OpacityIcon },
  { value: "Waves", label: "Water", Icon: WavesIcon },
  { value: "Grain", label: "Grain", Icon: GrainIcon },
  { value: "Memory", label: "Memory", Icon: MemoryIcon },
  { value: "VpnKey", label: "Key", Icon: KeyIcon },
  { value: "Fingerprint", label: "Fingerprint", Icon: FingerprintIcon },
  { value: "QrCode2", label: "Barcode", Icon: BarcodeIcon },
  { value: "DevicesOther", label: "Other Devices", Icon: DevicesOtherIcon },
];

const STORAGE_KEY_PREFIX = "inventoryFilterSettings_";

const InventoryFilterModal: React.FC<InventoryFilterModalProps> = ({
  open,
  onClose,
  companyId,
  onApply,
}) => {
  const [fields, setFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [iconMap, setIconMap] = useState<Record<string, string>>({});
  const [colorMap, setColorMap] = useState<Record<string, string>>({});

  // Load settings from localStorage or default when modal opens
  useEffect(() => {
    if (open && companyId) {
      const key = STORAGE_KEY_PREFIX + companyId;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const { fields: sf, icons, colors } = JSON.parse(saved);
          setSelectedFields(sf);
          setIconMap(icons);
          setColorMap(colors);
        } catch {
          localStorage.removeItem(key);
        }
      }
      setLoading(true);
      getInventoryFieldsByCompanyJust(companyId)
        .then((data) => {
          setFields(data);
          // initialize defaults if no saved
          if (!saved) {
            setSelectedFields(data);
            const defaultIcons: Record<string, string> = {};
            const defaultColors: Record<string, string> = {};
            data.forEach((field) => {
              defaultIcons[field] = ICON_OPTIONS[0].value;
              defaultColors[field] = "#1976d2";
            });
            setIconMap(defaultIcons);
            setColorMap(defaultColors);
          }
        })
        .catch((err) => console.error("Alanlar alınırken hata:", err))
        .finally(() => setLoading(false));
    }
  }, [open, companyId]);

  const handleToggle = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleIconChange = (field: string, value: string) => {
    setIconMap((prev) => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (field: string, value: string) => {
    setColorMap((prev) => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    const key = STORAGE_KEY_PREFIX + companyId;
    const toSave = {
      fields: selectedFields,
      icons: iconMap,
      colors: colorMap,
    };
    localStorage.setItem(key, JSON.stringify(toSave));
    console.log("Kaydedilen alanlar:", selectedFields);
    onApply?.();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Envanter Alan Filtreleme</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        ) : (
          <FormGroup>
            {fields.map((field) => {
              const selectedIcon = ICON_OPTIONS.find(
                (opt) => opt.value === iconMap[field]
              );
              return (
                <Box
                  key={field}
                  sx={{ mb: 2, borderBottom: "1px solid #eee", pb: 1 }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedFields.includes(field)}
                        onChange={() => handleToggle(field)}
                      />
                    }
                    label={field}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mt: 1,
                    }}
                  >
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel id={`${field}-icon-label`}>Icon</InputLabel>
                      <Select
                        labelId={`${field}-icon-label`}
                        value={iconMap[field] || ""}
                        label="Icon"
                        onChange={(e) =>
                          handleIconChange(field, e.target.value)
                        }
                        renderValue={(val) => {
                          const opt = ICON_OPTIONS.find((o) => o.value === val);
                          return (
                            <Box display="flex" alignItems="center">
                              {opt && <opt.Icon fontSize="small" />}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {opt?.label}
                              </Typography>
                            </Box>
                          );
                        }}
                      >
                        {ICON_OPTIONS.map(({ value, label, Icon }) => (
                          <MenuItem key={value} value={value}>
                            <ListItemIcon>
                              <Icon
                                fontSize="small"
                                sx={{ color: colorMap[field] }}
                              />
                            </ListItemIcon>
                            <Typography variant="body2">{label}</Typography>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="Renk"
                      type="color"
                      value={colorMap[field] || "#1976d2"}
                      onChange={(e) => handleColorChange(field, e.target.value)}
                      size="small"
                      sx={{ width: 56, p: 0 }}
                    />
                  </Box>
                </Box>
              );
            })}
          </FormGroup>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Kapat</Button>
        <Button onClick={handleApply} variant="contained">
          Uygula
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryFilterModal;
