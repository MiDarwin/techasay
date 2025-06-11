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
} from "@mui/material";
import {
  Add as AddIcon,
  RemoveCircle as RemoveIcon,
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

const BpetForm: React.FC<BpetFormProps> = ({
  open,
  branchId,
  bpetToEdit,
  onClose,
  onSuccess,
}) => {
  const [productName, setProductName] = useState("");
  const [attributes, setAttributes] = useState<
    { key: string; value: string }[]
  >([{ key: "", value: "" }]);
  const [error, setError] = useState("");

  // Edit modunda formu doldur
  useEffect(() => {
    if (bpetToEdit) {
      setProductName(bpetToEdit.product_name);
      const attrs = Object.entries(bpetToEdit.attributes || {}).map(
        ([k, v]) => ({ key: k, value: String(v) })
      );
      setAttributes(attrs.length ? attrs : [{ key: "", value: "" }]);
      setError("");
    } else {
      resetForm();
    }
  }, [bpetToEdit, open]);

  const resetForm = () => {
    setProductName("");
    setAttributes([{ key: "", value: "" }]);
    setError("");
  };

  const handleSave = async (shouldClose: boolean) => {
    try {
      const attrsObj: Record<string, any> = {};
      attributes.forEach(({ key, value }) => {
        if (!key) throw new Error("Özellik anahtarı boş olamaz.");
        attrsObj[key] = value;
      });
      if (bpetToEdit) {
        await updateBpet(bpetToEdit.id, {
          branch_id: branchId,
          attributes: attrsObj,
        });
      } else {
        await createBpet({
          product_name: productName,
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

  const handleAttrChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  const addRow = () => setAttributes([...attributes, { key: "", value: "" }]);
  const removeRow = (index: number) =>
    setAttributes(attributes.filter((_, i) => i !== index));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {bpetToEdit ? "BPET Güncelle" : "Yeni BPET Oluştur"}
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          {!bpetToEdit && (
            <TextField
              label="Ürün Adı"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              fullWidth
            />
          )}
          <Typography variant="subtitle1">Özellikler</Typography>
          {attributes.map((attr, idx) => (
            <Box key={idx} display="flex" alignItems="center" gap={1}>
              <TextField
                label="Anahtar"
                value={attr.key}
                onChange={(e) => handleAttrChange(idx, "key", e.target.value)}
                fullWidth
              />
              <TextField
                label="Değer"
                value={attr.value}
                onChange={(e) => handleAttrChange(idx, "value", e.target.value)}
                fullWidth
              />
              <IconButton
                disabled={attributes.length === 1}
                onClick={() => removeRow(idx)}
              >
                <RemoveIcon />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={addRow}>
            Özellik Ekle
          </Button>
          {error && <Typography color="error">{error}</Typography>}
        </Box>
      </DialogContent>
      <DialogActions>
        {!bpetToEdit ? (
          <>
            <Button variant="outlined" onClick={() => handleSave(false)}>
              Ekle ve Yeni
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSave(true)}
            >
              Ekle ve Kapat
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSave(true)}
          >
            Güncelle
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BpetForm;
