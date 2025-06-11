import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Button,
  TextField,
  Autocomplete,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import { motion } from "framer-motion";
import {
  getBranchesByCompanyId,
  getBpetsByBranch,
  createBpet,
} from "../../utils/api";
function BpetForm({ open, onClose, branchId, onSuccess }) {
  const [productName, setProductName] = useState("");
  const [attributes, setAttributes] = useState("{}");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const parsed = JSON.parse(attributes || "{}");
      await createBpet({
        product_name: productName,
        attributes: parsed,
        branch_id: branchId,
      });
      onSuccess();
      onClose();
    } catch {
      alert("JSON format hatalı veya kayıt başarısız");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni Bpet</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Ürün Adı"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <TextField
          label="Attributes (JSON)"
          multiline
          minRows={4}
          value={attributes}
          onChange={(e) => setAttributes(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button variant="contained" disabled={saving} onClick={handleSave}>
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export default BpetForm;
