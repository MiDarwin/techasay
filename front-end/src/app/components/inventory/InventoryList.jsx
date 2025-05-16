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
  useTheme,
  Chip,
  Stack,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InfoIcon from "@mui/icons-material/Info";
import InventoryUpdateModal from "./InvetoryUpdate";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import FarmDetailsModal from "./FarmDetailsModal";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import { alpha } from "@mui/material/styles";
/**
 * InventoryList: Envanter kayıtlarını eşit yükseklikte kartlar halinde gösterir.
 * Grid container alignItems="stretch" ile tüm kartlar aynı yüksekliğe uzanır.
 */
const InventoryList = ({ inventories = [], onEdit }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [detailInv, setDetailInv] = useState(null);
  const [open, setOpen] = useState(false);
  const [farmInv, setFarmInv] = useState(null); // yeni farm modal
  const theme = useTheme();

  const accents = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
  ];
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
          const FARM_KEYS = [
            "OutdoorTH_Sensor ID",
            "CO2_Sensor ID",
            "TH1_Sensor ID",
            "TH2_Sensor ID",
            "EC_Sensor ID",
          ];

          const isFarm = inv.branch_name?.startsWith("Kümes");
          const allEntries = Object.entries(inv.details || {}); // hepsi
          const entries = isFarm
            ? allEntries.filter(([k]) => FARM_KEYS.includes(k)) // sadece 5’i
            : allEntries;

          const preview = entries.slice(0, 5);
          const moreHidden = allEntries.length - preview.length; // 🔹 fark burada
          /* ----------------------------------------------------------- */

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
                  backgroundColor: "#EDF2F7",
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

                  {isFarm ? (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)", // 3 eşit sütun
                        gridTemplateRows: "repeat(3, 64px)", // 3 satır, her biri 64 px
                        gap: 1, // 8 px aralık
                        mt: 1,
                        minHeight: 64 * 3 + 8 * 2, // kart kaymasın
                      }}
                    >
                      {Array.from({ length: 9 }).map((_, slot) => {
                        const entry = preview[slot]; // sensör varsa doldur
                        const accent = accents[slot % accents.length];

                        /* BOŞ hücre: gözükmesin ama grid’i korusun */
                        if (!entry) return <Box key={slot} />;

                        const [key, value] = entry;
                        const sensor = key.split("_")[0]; // EC, TH1…

                        return (
                          <Box
                            key={key}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 1,
                              width: "100%",
                              height: "100%",
                              borderRadius: 3, // yuvarlak köşe
                              bgcolor: alpha(accent, 0.1),
                              border: `1px solid ${alpha(accent, 0.4)}`,
                              boxShadow: `0 0 4px ${alpha(accent, 0.25)}`,
                            }}
                          >
                            <DevicesOtherIcon sx={{ color: accent }} />
                            <Typography variant="subtitle2" fontWeight={600}>
                              {sensor} ID: {value}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    /* --- DİĞER ŞUBELER: eski liste --- */
                    preview.map(([key, value]) => (
                      <Box
                        key={key}
                        display="flex"
                        alignItems="center"
                        mb={0.5}
                      >
                        <InfoIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "primary.main" }}
                        />
                        <Typography variant="body2">
                          <strong>{key}:</strong> {value}
                        </Typography>
                      </Box>
                    ))
                  )}
                  {moreHidden > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      +{moreHidden} envanter daha…
                    </Typography>
                  )}
                </CardContent>
                <Divider sx={{ my: 1 }} />
                <CardActions
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  {/* Sol slot: Detay Göster (sadece detay fazlaysa) */}
                  <Box>
                    <Button
                      size="small"
                      onClick={() =>
                        isFarm ? setFarmInv(inv) : setDetailInv(inv)
                      }
                      disabled={!isFarm && moreHidden === 0} // farm → her zaman aktif
                    >
                      Detay Göster
                    </Button>
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
            <Typography color="black" variant="h6">
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
                  <Typography color="black" variant="body2">
                    <strong>{key}:</strong> {value}
                  </Typography>
                </Box>
              ))}
          </Box>
        </Box>
      </Modal>
      {/* Çiftlik şubeleri için yeni modal */}
      {farmInv && (
        <FarmDetailsModal
          open={Boolean(farmInv)}
          onClose={() => setFarmInv(null)}
          inv={farmInv}
        />
      )}
    </>
  );
};
export default InventoryList;
