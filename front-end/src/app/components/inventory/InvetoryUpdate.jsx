import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { updateInventory } from "@/app/utils/api";

const style = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
  maxHeight: "80vh",
  overflowY: "auto",
  width: 400,
};

/**
 * props:
 * - open: boolean
 * - inventory: { id, branch_id, branch_name, details }
 * - onClose: function
 * - onUpdated: callback(updatedInventory)
 */
const InventoryUpdateModal = ({
  open,
  inventory,
  onClose,
  onUpdated,
  fetchInventories,
}) => {
  const [fields, setFields] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (inventory) {
      setFields(inventory.details || {});
    }
  }, [inventory]);

  const handleChange = (key) => (e) => {
    setFields({ ...fields, [key]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateInventory(inventory.id, fields);
      onUpdated && onUpdated(updated);
      onClose();
    } catch (err) {
      console.error(err);
      // optionally show error to user
    } finally {
      setSaving(false);
    }
    const handleSave = async () => {
      await updateInventory(inventory.id, fields);
      onUpdated(); // Manager’daki fetchInventories() burada tetiklenir
      onClose();
    };
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      BackdropProps={{
        sx: { backdropFilter: "blur(4px)" },
      }}
    >
      <Box sx={style}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Envanter Güncelle</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        {Object.entries(fields).map(([key, value]) => (
          <TextField
            key={key}
            label={key}
            value={value}
            onChange={handleChange(key)}
            fullWidth
            margin="normal"
          />
        ))}
        <Box display="flex" justifyContent="flex-end" mt={2} gap={1}>
          <Button onClick={onClose} disabled={saving}>
            İptal
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Kaydediliyor..." : "Güncelle"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default InventoryUpdateModal;
