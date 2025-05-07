"use client";
import React from "react";
import {
  Modal,
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Divider,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";

/**
 * Modal to show detailed list of inventories
 * Props:
 *  - open: boolean
 *  - inventories: array of inventory objects
 *  - onClose: () => void
 *  - onEdit: (inventory) => void
 */
export default function InventoryDetailModal({
  open,
  inventories = [],
  onClose,
  onEdit,
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90vw",
          maxWidth: 1000,
          maxHeight: "80vh",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          outline: "none",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">Tüm Envanterler</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ overflowY: "auto", p: 2, flexGrow: 1 }}>
          <Grid container spacing={2} alignItems="stretch">
            {inventories.map((inv) => (
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
                      gap: 2,
                    }}
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
                        <Box display="flex" alignItems="center" sx={{ ml: 3 }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {new Date(inv.updated_date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Divider />

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
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
          </Grid>
        </Box>
      </Box>
    </Modal>
  );
}
