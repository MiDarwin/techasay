import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  CardActions,
  Box,
  Button,
  Divider,
  Modal,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InfoIcon from "@mui/icons-material/Info";
import InventoryUpdateModal from "./InvetoryUpdate";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

/**
 * InventoryList: Envanter kayıtlarını eşit yükseklikte kartlar halinde gösterir.
 * Grid container alignItems="stretch" ile tüm kartlar aynı yüksekliğe uzanır.
 */
const InventoryList = ({ inventories = [], onEdit }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [detailInv, setDetailInv] = useState(null);
  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <Grid container spacing={2} alignItems="stretch">
        {inventories.map((inv) => {
          const entries = Object.entries(inv.details || {});
          const preview = entries.slice(0, 5);
          const moreCount = entries.length - preview.length;

          return (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={inv.id}
              sx={{ display: "flex" }}
            >
              <Card
                sx={{
                  height: 320,
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  borderRadius: 2,
                  boxShadow: 2,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
                }}
              >
                <CardHeader
                  title={inv.branch_name}
                  subheader={`Envanter #${inv.id}`}
                  avatar={
                    <Box
                      sx={{
                        width: 6,
                        height: 40,
                        bgcolor: "primary.main",
                        borderRadius: 1,
                        mr: 1,
                      }}
                    />
                  }
                  sx={{ pb: 0 }}
                />

                <CardContent
                  sx={{ pt: 1, pb: 1, flexGrow: 1, overflowY: "auto" }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    color="text.secondary"
                  >
                    <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {new Date(inv.created_date).toLocaleDateString()}
                    </Typography>
                    {inv.updated_date && (
                      <Box display="flex" alignItems="center" sx={{ ml: 2 }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {new Date(inv.updated_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  {preview.map(([key, value]) => (
                    <Box key={key} display="flex" alignItems="center" mb={0.5}>
                      <InfoIcon
                        fontSize="small"
                        sx={{ mr: 1, color: "primary.main" }}
                      />
                      <Typography variant="body2">
                        <strong>{key}:</strong> {value}
                      </Typography>
                    </Box>
                  ))}

                  {moreCount > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      +{moreCount} envanter daha…
                    </Typography>
                  )}
                </CardContent>
                <Divider sx={{ my: 1 }} />
                <CardActions
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  {/* Sol slot: Detay Göster (sadece detay fazlaysa) */}
                  <Box>
                    {moreCount > 0 && (
                      <Button size="small" onClick={() => setDetailInv(inv)}>
                        Detay Göster
                      </Button>
                    )}
                  </Box>

                  {/* Sağ slot: Düzenle her zaman burada */}
                  <Box>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => onEdit(inv)}
                    >
                      Düzenle
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* ----------------------- */}
      {/* Detay Modal                */}
      {/* ----------------------- */}
      <Modal
        open={Boolean(detailInv)}
        onClose={() => setDetailInv(null)}
        sx={{ backdropFilter: "blur(4px)" }}
      >
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90vw",
            maxWidth: 600,
            maxHeight: "80vh",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            outline: "none",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Başlık */}
          <Box
            sx={{
              p: 2,
              borderBottom: (th) => `1px solid ${th.palette.divider}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">
              {detailInv?.branch_name} — Envanter detayları
            </Typography>
            <IconButton onClick={() => setDetailInv(null)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* İçerik */}
          <Box sx={{ overflowY: "auto", p: 2, flexGrow: 1 }}>
            {detailInv &&
              Object.entries(detailInv.details || {}).map(([key, value]) => (
                <Box key={key} display="flex" alignItems="center" mb={1}>
                  <InfoIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "primary.main" }}
                  />
                  <Typography variant="body2">
                    <strong>{key}:</strong> {value}
                  </Typography>
                </Box>
              ))}
          </Box>
        </Box>
      </Modal>
    </>
  );
};
export default InventoryList;
