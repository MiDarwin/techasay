import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Button,
  TextField,
  Autocomplete,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import { motion } from "framer-motion";
import {
  getBranchesByCompanyId,
  bulkDismountBpets,
  getBpetsByBranch,
  createBpet,
} from "../../utils/api";
import BpetForm from "./BpetForm";
import BpetList from "./BpetList";
export default function BpetManager() {
  const [branches, setBranches] = useState([]);
  const [branchLoading, setBranchLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [snackbar, setSnackbar] = useState(null);
  const [branchId, setBranchId] = useState(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const DEPOT_OPTION = { id: null, name: "Depo" };
  const allOptions = [DEPOT_OPTION, ...branches];
  const bumpRefresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    (async () => {
      const data = await getBranchesByCompanyId(3);
      setBranches(data);
      setBranchLoading(false);
    })();
  }, []);

  const reload = () => {
    // trigger useEffect by forcing new object
    setSelectedBranch((prev) => ({ ...prev }));
    setSnackbar({ severity: "success", msg: "Envanter güncellendi" });
  };

  const handleBulk = async () => {
    if (!selectedIds.length) return;
    try {
      await bulkDismountBpets(selectedIds, "");
      setSnackbar({
        open: true,
        message: "BPET’ler depoya taşındı.",
        severity: "success",
      });
      setRefreshKey((r) => r + 1);
      setSelectedIds([]);
    } catch {
      setSnackbar({
        open: true,
        message: "Taşıma başarısız.",
        severity: "error",
      });
    }
  };

  return (
    <Card as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* üst kontrol barı */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            gap: 2,
          }}
        >
          {/* Sol: Şube/Depo seçici */}
          <Box sx={{ flex: 0.15 }}>
            <Autocomplete
              options={allOptions}
              getOptionLabel={(opt) => opt.name}
              value={selectedBranch}
              onChange={(_, v) => {
                setSelectedBranch(v);
                setBranchId(v?.id ?? null);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Şube veya Depo" fullWidth />
              )}
            />
          </Box>

          {/* Sağ: Butonlar */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled={!selectedBranch}
              onClick={() => setOpenForm(true)}
            >
              Yeni BPET
            </Button>

            <Button
              variant="contained"
              color="warning"
              disabled={selectedIds.length === 0}
              onClick={handleBulk}
            >
              Toplu Depoya Kaldır ({selectedIds.length})
            </Button>
          </Box>
        </Box>

        <Divider />

        {selectedBranch ? (
          <BpetList
            branchId={selectedBranch.id}
            key={selectedBranch.id}
            onSelectionChange={setSelectedIds}
            refreshKey={refreshKey}
            bumpRefresh={bumpRefresh}
          />
        ) : (
          <Typography>Şube seçiniz.</Typography>
        )}
      </CardContent>

      {/* Form Dialog */}
      {openForm && (
        <BpetForm
          open={openForm}
          branchId={selectedBranch?.id}
          onClose={() => setOpenForm(false)}
          onSuccess={() => {
            // ekranı hemen yenile
            bumpRefresh?.(); // ana listeyi de garantiye al
          }}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
      >
        {snackbar && (
          <Alert
            severity={snackbar.severity}
            variant="filled"
            onClose={() => setSnackbar(null)}
          >
            {snackbar.msg}
          </Alert>
        )}
      </Snackbar>
    </Card>
  );
}
