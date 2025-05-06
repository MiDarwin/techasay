import React from "react";
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InfoIcon from "@mui/icons-material/Info";

/**
 * InventoryList: Envanter kayıtlarını kart şeklinde gösterir.
 * props.inventories: Array<{
 *   id: number;
 *   branch_id: number;
 *   branch_name: string;
 *   created_date: string;
 *   updated_date: string | null;
 *   details: Record<string, any>;
 * }>
 */
const InventoryList = ({ inventories = [] }) => {
  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Grid container spacing={2}>
      {inventories.map((inv) => (
        <Grid item xs={12} sm={6} md={4} key={inv.id}>
          <Card
            variant="outlined"
            sx={{ minHeight: 180, position: "relative" }}
          >
            <CardHeader
              title={`Envanter #${inv.id}`}
              subheader={inv.branch_name}
              sx={{ pb: 0 }}
            />
            <CardContent sx={{ pt: 1 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">{inv.branch_name}</Typography>
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
    </Grid>
  );
};

export default InventoryList;
