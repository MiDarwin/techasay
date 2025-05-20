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
import CloseIcon from "@mui/icons-material/Close";
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
      if (!f.key) return; // 🔹 anahtarsızları atla
      const [sensor] = f.key.split("_", 1);
      if (!g[sensor]) g[sensor] = [];
      g[sensor].push(f);
    });
    return g;
  }, [fields]);

  const ungrouped = fields.filter((f) => !f.key); // 🔹 anahtarsız satırlar

  return (
    <Modal open={open} onClose={onClose} disablePortal>
      <Box sx={modalStyle}>
        {/* ---------- Başlık ---------- */}
        <Box
          sx={{
            p: 2,
            borderBottom: (th) => `1px solid ${th.palette.divider}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography color="black" variant="h6">
            Envanter #{inventory?.id} Düzenle
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* --------- İçerik (scrollable) --------- */}
        <Box sx={{ maxHeight: "calc(80vh - 120px)", overflowY: "auto", p: 2 }}>
          {isFarm ? (
            <>
              {/* sensör akordeonları */}
              {Object.entries(grouped).map(([sensor, list], idx) => (
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
                      bgcolor: "grey.50",
                      pl: 3,
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        left: 8,
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
                        const gi = fields.findIndex((f) => f === fld);
                        const used = fields.map((f) => f.key);
                        const opts = suggestions.filter(
                          (o) => o && !used.includes(o)
                        );
                        return (
                          <React.Fragment key={gi}>
                            <Grid item xs={5}>
                              <Autocomplete
                                freeSolo
                                options={opts}
                                value={fld.key}
                                filterOptions={(o, st) =>
                                  o.filter((v) =>
                                    v
                                      .toLowerCase()
                                      .includes(st.inputValue.toLowerCase())
                                  )
                                }
                                onInputChange={(e, v) =>
                                  handleFieldChange(gi, "key", v)
                                }
                                renderInput={(p) => (
                                  <TextField {...p} label="Anahtar" fullWidth />
                                )}
                              />
                            </Grid>
                            <Grid item xs={5}>
                              <TextField
                                label="Değer"
                                value={fld.value}
                                onChange={(e) =>
                                  handleFieldChange(gi, "value", e.target.value)
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
                                onClick={() => removeField(gi)}
                                color="error"
                              >
                                <RemoveCircleIcon />
                              </IconButton>
                            </Grid>
                          </React.Fragment>
                        );
                      })}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}

              {/* anahtarsız (yeni) satırlar */}
              {ungrouped.length > 0 && (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {ungrouped.map((fld, idx) => {
                    const gi = fields.findIndex((f) => f === fld);
                    const used = fields.map((f) => f.key);
                    const opts = suggestions.filter(
                      (o) => o && !used.includes(o)
                    );
                    return (
                      <React.Fragment key={`empty-${idx}`}>
                        <Grid item xs={5}>
                          <Autocomplete
                            freeSolo
                            options={opts}
                            value={fld.key}
                            filterOptions={(o, st) =>
                              o.filter((v) =>
                                v
                                  .toLowerCase()
                                  .includes(st.inputValue.toLowerCase())
                              )
                            }
                            onInputChange={(e, v) =>
                              handleFieldChange(gi, "key", v)
                            }
                            renderInput={(p) => (
                              <TextField {...p} label="Anahtar" fullWidth />
                            )}
                          />
                        </Grid>
                        <Grid item xs={5}>
                          <TextField
                            label="Değer"
                            value={fld.value}
                            onChange={(e) =>
                              handleFieldChange(gi, "value", e.target.value)
                            }
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={2} display="flex" alignItems="center">
                          <IconButton
                            onClick={() => removeField(gi)}
                            color="error"
                          >
                            <RemoveCircleIcon />
                          </IconButton>
                        </Grid>
                      </React.Fragment>
                    );
                  })}
                </Grid>
              )}
            </>
          ) : (
            /* ----------- NORMAL ŞUBE ----------- */
            <Grid container spacing={2}>
              {fields.map((fld, idx) => {
                const used = fields.map((f) => f.key);
                const opts = suggestions.filter((o) => o && !used.includes(o));
                return (
                  <React.Fragment key={idx}>
                    <Grid item xs={5}>
                      <Autocomplete
                        freeSolo
                        options={opts}
                        value={fld.key}
                        filterOptions={(o, st) =>
                          o.filter((v) =>
                            v
                              .toLowerCase()
                              .includes(st.inputValue.toLowerCase())
                          )
                        }
                        onInputChange={(e, v) =>
                          handleFieldChange(idx, "key", v)
                        }
                        renderInput={(p) => (
                          <TextField {...p} label="Anahtar" fullWidth />
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
            </Grid>
          )}
        </Box>

        {/* --------- Footer --------- */}
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

          <Button
            variant="outlined"
            startIcon={<AddCircleIcon />}
            onClick={addField}
            sx={{ mr: 1 }}
          >
            Yeni Envanter &nbsp;Ekle
          </Button>

          <Button variant="contained" onClick={handleSubmit}>
            Güncelle
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
