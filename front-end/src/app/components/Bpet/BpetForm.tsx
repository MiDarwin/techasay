import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  RemoveCircle as RemoveIcon,
  Router as RouterIcon,
  SimCard as SimCardIcon,
  SettingsInputAntenna as AntennaIcon,
  NetworkWifi as NetworkWifiIcon,
  DevicesOther as DevicesOtherIcon,
} from "@mui/icons-material";
import { createBpet, updateBpet } from "../../utils/api";

interface BpetFormProps {
  open: boolean;
  branchId: number | null;
  bpetToEdit?: {
    id: number;
    product_name: string;
    attributes: Record<string, any>;
  };
  onClose: () => void;
  onSuccess: () => void;
}

type Attr = { key: string; value: string };

const defaultKeys = ["Adet", "IP", "Tür", "Seri No", "IMEI"];

const iconOptions = [
  { value: "Modem", icon: <RouterIcon fontSize="large" />, tooltip: "Modem" },
  { value: "SIM", icon: <SimCardIcon fontSize="large" />, tooltip: "SIM" },
  {
    value: "GSM Anten",
    icon: <AntennaIcon fontSize="large" />,
    tooltip: "GSM Anten",
  },
  {
    value: "WiFi Anten",
    icon: <NetworkWifiIcon fontSize="large" />,
    tooltip: "WiFi Anten",
  },
  {
    value: "Diğer",
    icon: <DevicesOtherIcon fontSize="large" />,
    tooltip: "Diğer",
  },
];
const presetKeys = ["Adet", "IP", "Tür", "Seri No", "IMEI"];
const BpetForm: React.FC<BpetFormProps> = ({
  open,
  branchId,
  bpetToEdit,
  onClose,
  onSuccess,
}) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [attributes, setAttributes] = useState<Attr[]>([]);

  const [error, setError] = useState("");

  /** Populate form in edit mode */
  useEffect(() => {
    if (bpetToEdit) {
      // Determine icon category if possible
      const found = iconOptions.find(
        (o) => o.value.toLowerCase() === bpetToEdit.product_name.toLowerCase()
      );
      setSelectedType(found ? found.value : "Diğer");
      setProductName(bpetToEdit.product_name);
      const attrs = Object.entries(bpetToEdit.attributes || {}).map(
        ([k, v]) => ({ key: k, value: String(v) })
      );
      setAttributes(attrs);
    } else if (open) {
      resetForm();
    }
    setError("");
  }, [bpetToEdit, open]);

  const resetForm = () => {
    setSelectedType(null);
    setProductName("");
    setAttributes([]); // 🔸 defaultKeys KALDIRILDI
    setError("");
  };

  const handleTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: string | null
  ) => {
    if (newType !== null) {
      setSelectedType(newType);
      // Clear custom name when changing away from "Diğer"
      if (newType !== "Diğer") {
        setProductName("");
      }
    }
  };

  const handleAttrChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  const addRow = (presetKey?: string) =>
    setAttributes((prev) => [...prev, { key: presetKey ?? "", value: "" }]);
  const removeRow = (index: number) =>
    setAttributes(attributes.filter((_, i) => i !== index));

  const handleSave = async (shouldClose: boolean) => {
    try {
      const attrsObj: Record<string, any> = {};
      attributes.forEach(({ key, value }) => {
        if (!key) throw new Error("Özellik anahtarı boş olamaz.");
        attrsObj[key] = value;
      });

      if (bpetToEdit) {
        // Update only attributes (product name immutable)
        await updateBpet(bpetToEdit.id, {
          branch_id: branchId,
          attributes: attrsObj,
        });
      } else {
        const finalName =
          selectedType === "Diğer" ? productName : selectedType ?? "";
        if (!finalName) throw new Error("Ürün tipi seçmelisiniz.");
        await createBpet({
          product_name: finalName,
          attributes: attrsObj,
          branch_id: branchId,
        });
      }

      onSuccess();
      if (shouldClose) onClose();
      else if (!bpetToEdit) resetForm();
    } catch (e: any) {
      setError(e.message || "Hata: Sunucu hatası veya eksik veri.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {bpetToEdit ? "BPET Güncelle" : "Yeni BPET Oluştur"}
      </DialogTitle>
      <DialogContent dividers sx={{ mt: 1 }}>
        {/* Icon Selection */}
        <Box display="flex" justifyContent="center" mb={2}>
          <ToggleButtonGroup
            value={selectedType}
            exclusive
            onChange={handleTypeChange}
            color="primary"
            disabled={Boolean(bpetToEdit)}
          >
            {iconOptions.map((opt) => (
              <Tooltip key={opt.value} title={opt.tooltip} arrow>
                <ToggleButton
                  value={opt.value}
                  sx={{ p: 2, flexDirection: "column" }}
                >
                  {opt.icon}
                  <Typography variant="caption">{opt.value}</Typography>
                </ToggleButton>
              </Tooltip>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Custom product name for "Diğer" */}
        {!bpetToEdit && selectedType === "Diğer" && (
          <TextField
            label="Ürün Adı"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
        )}

        {/* Attributes Accordion */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Özellikler</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* Chip menü – bastıkça satır ekler */}
            <Box mb={2} display="flex" flexWrap="wrap" gap={1}>
              {["Adet", "IP", "Tür", "Seri No", "IMEI"].map((k) => (
                <Chip
                  key={k}
                  label={k}
                  color="primary"
                  clickable
                  onClick={() => addRow(k)}
                />
              ))}
              <Chip
                label="Diğer"
                color="secondary"
                clickable
                onClick={() => addRow()}
              />
            </Box>

            {/* Satırlar yalnızca eklenince görünür */}
            {attributes.map((attr, idx) => {
              const locked = ["Adet", "IP", "Tür", "Seri No", "IMEI"].includes(
                attr.key
              );
              return (
                <Box
                  key={idx}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mb={1}
                >
                  {locked ? (
                    <Chip label={attr.key} sx={{ minWidth: 90 }} />
                  ) : (
                    <TextField
                      label="Anahtar"
                      value={attr.key}
                      onChange={(e) =>
                        handleAttrChange(idx, "key", e.target.value)
                      }
                      fullWidth
                    />
                  )}
                  <TextField
                    label="Değer"
                    value={attr.value}
                    onChange={(e) =>
                      handleAttrChange(idx, "value", e.target.value)
                    }
                    fullWidth
                  />
                  <IconButton
                    onClick={() => removeRow(idx)}
                    color="error"
                    disabled={attributes.length === 0}
                  >
                    <RemoveIcon />
                  </IconButton>
                </Box>
              );
            })}

            {/* Elle boş satır eklemek için */}
            <Button startIcon={<AddIcon />} onClick={() => addRow()}>
              Özellik Ekle
            </Button>
          </AccordionDetails>
        </Accordion>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        {!bpetToEdit ? (
          <>
            <Button variant="outlined" onClick={() => handleSave(false)}>
              Ekle ve Yeni
            </Button>
            <Button variant="contained" onClick={() => handleSave(true)}>
              Ekle ve Kapat
            </Button>
          </>
        ) : (
          <Button variant="contained" onClick={() => handleSave(true)}>
            Güncelle
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BpetForm;
