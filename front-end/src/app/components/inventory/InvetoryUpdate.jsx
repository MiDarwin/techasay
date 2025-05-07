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
  Autocomplete,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { updateInventory, getInventoryFieldsByCompany } from "@/app/utils/api";

const modalStyle = {
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
};

export default function InventoryUpdateModal({
  open,
  onClose,
  inventory,
  companyId,
  onUpdated,
}) {
  const [fields, setFields] = useState([{ key: "", value: "" }]);
  const [suggestions, setSuggestions] = useState([]);

  // Initialize fields from inventory
  useEffect(() => {
    if (inventory) {
      const init = Object.entries(inventory.details || {}).map(
        ([key, value]) => ({ key, value })
      );
      setFields(init.length ? init : [{ key: "", value: "" }]);
    }
  }, [inventory]);

  // Fetch suggestion keys based on companyId
  useEffect(() => {
    if (companyId) {
      getInventoryFieldsByCompany(companyId)
        .then((keys) => setSuggestions(keys))
        .catch(console.error);
    }
  }, [companyId]);

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
    const newDetails = fields.reduce((acc, { key, value }) => {
      if (key.trim()) acc[key.trim()] = value;
      return acc;
    }, {});

    try {
      await updateInventory(inventory.id, newDetails);
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal open={open} onClose={onClose} disablePortal>
      <Box sx={modalStyle}>
        {/* Scrollable content */}
        <Box sx={{ maxHeight: "calc(80vh - 64px)", overflowY: "auto" }}>
          <Box sx={{ p: 2 }}>
            <Typography color="black" variant="h6" mb={2}>
              Envanter #{inventory?.id} Düzenle
            </Typography>
            <Grid container spacing={2}>
              {fields.map((fld, idx) => {
                // filter out already used keys
                const used = fields.map((f) => f.key);
                const options = suggestions.filter(
                  (opt) => opt && !used.includes(opt)
                );
                return (
                  <React.Fragment key={idx}>
                    <Grid item xs={5}>
                      <Autocomplete
                        freeSolo
                        options={options}
                        value={fld.key}
                        onInputChange={(e, val) =>
                          handleFieldChange(idx, "key", val)
                        }
                        renderInput={(params) => (
                          <TextField {...params} label="Anahtar" fullWidth />
                        )}
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
                      <IconButton
                        onClick={() => removeField(idx)}
                        color="error"
                      >
                        <RemoveCircleIcon />
                      </IconButton>
                    </Grid>
                  </React.Fragment>
                );
              })}
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
        {/* Footer */}
        <Box
          sx={{
            p: 2,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
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
