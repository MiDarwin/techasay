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
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InfoIcon from "@mui/icons-material/Info";
import InventoryUpdateModal from "./InvetoryUpdate";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";

/**
 * InventoryList: Envanter kayıtlarını eşit yükseklikte kartlar halinde gösterir.
 * Grid container alignItems="stretch" ile tüm kartlar aynı yüksekliğe uzanır.
 */
const InventoryList = ({ inventories = [], onEdit }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState(null);
  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Grid container spacing={2} alignItems="stretch">
      {inventories.map((inv) => (
        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          key={inv.id}
          style={{ display: "flex" }}
        >
          <Card
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              borderRadius: 2,
              boxShadow: 2,
              transition: "transform 0.2s, box-shadow 0.2s",
              ":hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardHeader
              title={inv.branch_name}
              subheader={`Envanter #${inv.id}`}
              avatar={
                <Box
                  sx={{
                    width: 8,
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
              sx={{
                pt: 2,
                pb: 2,
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                gap: 2, // her bölüm arasında boşluk
              }}
            >
              {/* Tarih ve Saat */}
              <Box display="flex" alignItems="center" color="text.secondary">
                <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {formatDate(inv.created_date)}
                </Typography>
                {inv.updated_date && (
                  <Box display="flex" alignItems="center" sx={{ ml: 3 }}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {formatDate(inv.updated_date)}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Ayırıcı Çizgi */}
              <Divider />

              {/* Dinamik Detaylar */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1, // her bir detay arasında boşluk
                  flexGrow: 1, // altta kalan alanı kaplasın
                }}
              >
                {Object.entries(inv.details || {}).map(([key, value]) => (
                  <Box key={key} display="flex" alignItems="center">
                    <InfoIcon
                      fontSize="small"
                      sx={{ mr: 1, color: "primary.main" }}
                    />
                    <Typography variant="body2" color="text.primary">
                      <strong>{key}:</strong> {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end" }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => onEdit(inv)}
              >
                Düzenle
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
      <InventoryUpdateModal
        open={modalOpen}
        inventory={selectedInv}
        onClose={() => setModalOpen(false)}
        onUpdated={(updated) => {
          // envanter listesini yeniden fetch et ya da state güncelle
          fetchInventories();
        }}
      />
    </Grid>
  );
};

export default InventoryList;
