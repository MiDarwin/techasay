import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Button,
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
            variant="outlined"
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1, // tüm kartlar eşit yükseklikte olsun
            }}
          >
            <CardHeader
              title={inv.branch_name}
              subheader={`Envanter #${inv.id}`}
              sx={{ pb: 0 }}
            />
            <CardContent
              sx={{
                pt: 1,
                flexGrow: 1, // içerik bölgesi genişlesin
                overflowY: "auto",
              }}
            >
              <Box display="flex" alignItems="center" mb={1}>
                <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                  {formatDate(inv.created_date)}
                </Typography>
                {inv.updated_date && (
                  <>
                    <AccessTimeIcon fontSize="small" sx={{ ml: 2, mr: 0.5 }} />
                    <Typography variant="body2">
                      {formatDate(inv.updated_date)}
                    </Typography>
                  </>
                )}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onEdit(inv)}
                >
                  Düzenle
                </Button>
              </Box>

              {/* Dinamik detaylar */}
              {Object.entries(inv.details || {}).map(([key, value]) => (
                <Box key={key} display="flex" alignItems="center" mb={0.5}>
                  <InfoIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">
                    <strong>{key}:</strong> {value}
                  </Typography>
                </Box>
              ))}
            </CardContent>
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
