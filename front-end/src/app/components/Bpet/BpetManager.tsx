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
  Stack,
  Divider,
  Typography,
  alpha,
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
import Image from "next/image"; // Next.js optimizasyonu
import BpetForm from "./BpetForm";
import BpetList from "./BpetList";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import UploadIcon from "@mui/icons-material/Upload";
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
  const depoOption = allOptions.find((o) => o.name === "Depo");
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
    /* 1️⃣  Yarı saydam, yumuşak gölgeli “glass” kart  */
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      elevation={0}
      sx={{
        backdropFilter: "blur(8px)",
        background: "#EDF2F7",
        borderRadius: 4,
        boxShadow: 3,
        p: 2,
      }}
    >
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* ▸ Yuvarlatılmış kontrol barı */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderRadius: 3,
            bgcolor: "#EDF2F7",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {/* Sol taraf: Logo + Şube/Depo seçici */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Image
              src="/images/bpetlogo.svg"
              alt="BPET"
              width={120}
              height={120}
              priority
            />

            <Box sx={{ minWidth: 260 }}>
              <Autocomplete
                options={allOptions}
                getOptionLabel={(o) => o.name}
                value={selectedBranch}
                onChange={(_, v) => {
                  setSelectedBranch(v);
                  setBranchId(v?.id ?? null);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Şube veya Depo"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <WarehouseIcon sx={{ mr: 1 }} />
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Box>
          </Box>
          {/* Aksiyon butonları */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled={!selectedBranch}
              onClick={() => setOpenForm(true)}
            >
              Yeni BPET
            </Button>

            <Button
              variant="outlined"
              color="warning"
              startIcon={<UploadIcon />}
              disabled={selectedIds.length === 0}
              onClick={handleBulk}
            >
              Depoya Kaldır&nbsp;({selectedIds.length})
            </Button>

            {/* 🔸 Yeni Depo Görüntüle butonu */}
            <Button
              variant="text"
              startIcon={<WarehouseIcon />} // aynı ikon iş görür
              onClick={() => {
                if (depoOption) {
                  setSelectedBranch(depoOption);
                  setBranchId(depoOption.id);
                }
              }}
            >
              Depo Görüntüle
            </Button>
          </Stack>
        </Box>

        <Divider />

        {/* 3️⃣  Liste veya boş-ekran çağrısı */}
        {selectedBranch ? (
          <BpetList
            branchId={selectedBranch.id}
            key={selectedBranch.id}
            onSelectionChange={setSelectedIds}
            refreshKey={refreshKey}
            bumpRefresh={bumpRefresh}
          />
        ) : (
          <Stack alignItems="center" spacing={2} sx={{ py: 6, opacity: 0.7 }}>
            <img
              src="/images/choose-branch.svg"
              alt="Şube seç"
              width={180}
              height={180}
            />
            <Typography variant="h6">
              Lütfen sol üstten bir şube seçin
            </Typography>
          </Stack>
        )}
      </CardContent>

      {/* 4️⃣  Dialog & Snackbar parçaları (değişmedi) */}
      {openForm && (
        <BpetForm
          open={openForm}
          branchId={selectedBranch?.id}
          onClose={() => setOpenForm(false)}
          onSuccess={() => bumpRefresh?.()}
        />
      )}

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
            sx={{ borderRadius: 2 }}
          >
            {snackbar.msg}
          </Alert>
        )}
      </Snackbar>
    </Card>
  );
}
