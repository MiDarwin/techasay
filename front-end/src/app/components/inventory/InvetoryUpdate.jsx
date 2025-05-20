"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Box,
  Grid,
  TextField,
  Button,
  IconButton,
  Typography,
  Autocomplete,
  Accordion, // 🆕
  AccordionSummary, // 🆕
  AccordionDetails, // 🆕
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; // 🆕
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { updateInventory, getInventoryFieldsByCompany } from "@/app/utils/api";
import { useTheme, alpha } from "@mui/material/styles"; // alpha gerekiyorsa

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
  const theme = useTheme(); //  🎨

  const accents = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
  ];
  /* ---------- 🆕 Kümes kontrolü ---------- */
  const isFarm = inventory?.branch_name?.startsWith("Kümes");

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

  const addField = () => setFields((c) => [...c, { key: "", value: "" }]);
  const removeField = (idx) => setFields((c) => c.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    const newDetails = {};
    fields.forEach(({ key, value }) => {
      if (key.trim()) newDetails[key.trim()] = value;
    });
    try {
      await updateInventory(inventory.id, newDetails);
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------- 🆕 Sensör-bazlı grupla ---------- */
  const grouped = useMemo(() => {
    const g = {};
    fields.forEach((f) => {
      const [sensor] = (f.key || "_").split("_", 1); // EC_AppEUI -> EC
      if (!g[sensor]) g[sensor] = [];
      g[sensor].push(f);
    });
    return g;
  }, [fields]);

  return (
    <Modal open={open} onClose={onClose} disablePortal>
      <Box sx={modalStyle}>
        {/* Scrollable content */}
        <Box sx={{ maxHeight: "calc(80vh - 64px)", overflowY: "auto" }}>
          <Box sx={{ p: 2 }}>
            <Typography color="black" variant="h6" mb={2}>
              Envanter #{inventory?.id} Düzenle
            </Typography>

            {/* ============ KÜMES ============== */}
            {isFarm ? (
              Object.entries(grouped).map(([sensor, list], idx) => (
                <Accordion
                  key={sensor}
                  disableGutters
                  elevation={0}
                  sx={{
                    mb: 1,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "grey.200",
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      bgcolor: "grey.50", // açık zemin
                      "& .MuiAccordionSummary-content": {
                        alignItems: "center",
                      },
                      pl: 2,
                      position: "relative",
                      "&::before": {
                        // sol renk şeridi
                        content: '""',
                        position: "absolute", // 🔹 konumlandır
                        left: 8, // 8 px içeriden
                        top: 6,
                        bottom: 6,
                        width: 4,
                        bgcolor: accents[idx % accents.length],
                        borderRadius: 1,
                      },
                    }}
                  >
                    <Typography fontWeight={600}>{sensor}</Typography>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {list.map((fld) => {
                        const globalIdx = fields.findIndex((f) => f === fld);
                        const used = fields.map((f) => f.key);
                        const options = suggestions.filter(
                          (opt) => opt && !used.includes(opt)
                        );
                        return (
                          <React.Fragment key={globalIdx}>
                            <Grid item xs={5}>
                              <Autocomplete
                                freeSolo
                                options={options}
                                value={fld.key}
                                onInputChange={(e, v) =>
                                  handleFieldChange(globalIdx, "key", v)
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Anahtar"
                                    fullWidth
                                  />
                                )}
                              />
                            </Grid>
                            <Grid item xs={5}>
                              <TextField
                                label="Değer"
                                value={fld.value}
                                onChange={(e) =>
                                  handleFieldChange(
                                    globalIdx,
                                    "value",
                                    e.target.value
                                  )
                                }
                                fullWidth
                              />
                            </Grid>
                            <Grid
                              item
                              xs={2}
                              display="flex"
                              alignItems="center"
                            >
                              <IconButton
                                onClick={() => removeField(globalIdx)}
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
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              /* ============ NORMAL ŞUBE ============== */
              <Grid container spacing={2}>
                {fields.map((fld, idx) => {
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
            )}
          </Box>
        </Box>
        {/* Footer */}
        <Box
          sx={{
            p: 2,
            borderTop: (th) => `1px solid ${th.palette.divider}`,
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
