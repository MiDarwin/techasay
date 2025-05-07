"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Grid,
  TextField,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { updateInventory } from "@/app/utils/api";

const modalStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  maxHeight: "75vh", // sayfanın yükseklik oranına göre sınır
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  overflowY: "auto", // içerik taşarsa scroll
};

export default function InventoryUpdateModal({
  open,
  onClose,
  inventory,
  onUpdated,
}) {
  // dynamic list of detail fields
  const [fields, setFields] = useState([{ key: "", value: "" }]);

  useEffect(() => {
    if (inventory) {
      const init = Object.entries(inventory.details || {}).map(
        ([key, value]) => ({ key, value })
      );
      setFields(init.length ? init : [{ key: "", value: "" }]);
    }
  }, [inventory]);

  const handleFieldChange = (idx, name, val) => {
    setFields((curr) =>
      curr.map((f, i) => (i === idx ? { ...f, [name]: val } : f))
    );
  };

  const addField = () => {
    setFields((curr) => [...curr, { key: "", value: "" }]);
  };

  const removeField = (idx) => {
    setFields((curr) => curr.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    // build details object
    const newDetails = fields.reduce((acc, { key, value }) => {
      if (key.trim()) acc[key.trim()] = value;
      return acc;
    }, {});

    try {
      // Call API with correct signature: (inventory_id, updates)
      await updateInventory(inventory.id, newDetails);
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      // optionally show error toast
    }
  };

  return (
    <Modal open={open} onClose={onClose} disablePortal>
      <Box
        sx={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          maxHeight: "80vh",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          overflow: "hidden",
        }}
      >
        {/* Scrollable iç bölüm: sadece orta kısmı kaydırılır */}
        <Box
          sx={{
            maxHeight: "calc(80vh - 64px)",
            overflowY: "auto",
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography color="black" variant="h6" mb={2}>
              Envanter #{inventory?.id} Düzenle
            </Typography>
            <Grid container spacing={2}>
              {fields.map((fld, idx) => (
                <React.Fragment key={idx}>
                  <Grid item xs={5}>
                    <TextField
                      label="Anahtar"
                      value={fld.key}
                      onChange={(e) =>
                        handleFieldChange(idx, "key", e.target.value)
                      }
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      label="Değer"
                      value={fld.value}
                      onChange={(e) =>
                        handleFieldChange(idx, "value", e.target.value)
                      }
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={2} display="flex" alignItems="center">
                    <IconButton onClick={() => removeField(idx)} color="error">
                      <RemoveCircleIcon />
                    </IconButton>
                  </Grid>
                </React.Fragment>
              ))}
              <Grid item xs={12}>
                <Button
                  startIcon={<AddCircleIcon />}
                  onClick={addField}
                  variant="text"
                >
                  Alan Ekle
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
        {/* Sabit footer */}
        <Box
          sx={{
            p: 2,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2,
          }}
        >
          <Button onClick={onClose}>İptal</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Güncelle
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
