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
  const DEPOT_OPTION = { id: null, name: "Depo" };
  const allOptions = [DEPOT_OPTION, ...branches];

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
  useEffect(() => {
    console.log("Seçili şube:", branchId);
    if (!branchId) return;
    // …
  }, [branchId]);
  return (
    <Card as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <CardHeader
        title={<Typography variant="h6">Bpet Envanteri</Typography>}
      />
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* üst kontrol barı */}
        <Box display="flex" gap={2} alignItems="center">
          <Autocomplete
            options={allOptions}
            getOptionLabel={(opt) => opt.name}
            value={selectedBranch}
            onChange={(_, v) => {
              setSelectedBranch(v);
              setBranchId(v?.id ?? null);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Şube veya Depo" />
            )}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!selectedBranch}
            onClick={() => setOpenForm(true)}
          >
            Yeni Bpet
          </Button>
        </Box>

        <Divider />

        {selectedBranch ? (
          <BpetList branchId={selectedBranch.id} key={selectedBranch.id} />
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
          onSuccess={reload}
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
