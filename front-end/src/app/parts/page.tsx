"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Chip,
  Typography,
  Autocomplete,
  TextField,
  CircularProgress,
  Button,
  Divider,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import { DataGrid } from "@mui/x-data-grid";
import { motion } from "framer-motion";

import {
  getBranchesByCompanyId,
  getBranchPartHistory,
  dismountParts,
  getPartHistory,
} from "../utils/api";

// ---------------- History Modal ----------------
function HistoryModal({ open, onClose, serial }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const data = await getPartHistory(serial);
        setRows(
          data.map((r) => ({
            id: r.id,
            state: r.state,
            branch: r.branch_id ?? "Depo",
            started: new Date(r.started_at).toLocaleString(),
            ended: r.ended_at ? new Date(r.ended_at).toLocaleString() : "-",
            note: r.note ?? "-",
          }))
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [open, serial]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <HistoryIcon fontSize="small" sx={{ mr: 1 }} /> {serial} – Geçmiş
      </DialogTitle>
      <DialogContent dividers sx={{ height: 420 }}>
        <DataGrid
          rows={rows}
          columns={[
            { field: "state", headerName: "Durum", flex: 1 },
            { field: "branch", headerName: "Şube", flex: 1 },
            { field: "started", headerName: "Başlangıç", flex: 1.3 },
            { field: "ended", headerName: "Bitiş", flex: 1.3 },
            { field: "note", headerName: "Not", flex: 1.5 },
          ]}
          loading={loading}
          pageSize={5}
          autoHeight
          disableRowSelectionOnClick
          density="compact"
        />
      </DialogContent>
    </Dialog>
  );
}

// ---------------- Main Component ----------------
export default function PartManager() {
  const [branches, setBranches] = useState([]);
  const [branchLoading, setBranchLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSerials, setSelectedSerials] = useState([]);
  const [historySerial, setHistorySerial] = useState(null);
  const [snackbar, setSnackbar] = useState(null);

  // ------------- fetch branches once -------------
  useEffect(() => {
    (async () => {
      try {
        const data = await getBranchesByCompanyId(3);
        setBranches(data);
      } finally {
        setBranchLoading(false);
      }
    })();
  }, []);

  // ------------- fetch inventories & build tree -------------
  useEffect(() => {
    if (!selectedBranch) return;
    (async () => {
      setLoading(true);
      try {
        const data = await getInventoryByBranch(selectedBranch.id);
        const treeRows = [];
        data.forEach((inv) => {
          const parentLabel = `Envanter #${inv.id}`;
          treeRows.push({
            id: `inv-${inv.id}`,
            label: parentLabel,
            path: [parentLabel],
            isGroup: true,
          });
          const detailsArr = Array.isArray(inv.details)
            ? inv.details
            : [inv.details];
          detailsArr.forEach((item) => {
            const serial = item.serial_no || item.IMEI || crypto.randomUUID();
            treeRows.push({
              id: `${inv.id}-${serial}`,
              path: [parentLabel, serial],
              serial_no: serial,
              label: serial,
              kind: item.kind || item.Tür || "-",
              state: item.status || "in_use",
              imei: item.IMEI || "-",
              wan_ip: item.wan_ip || item["Wan IP"] || "-",
            });
          });
        });
        setRows(treeRows);
      } finally {
        setLoading(false);
        setSelectedSerials([]);
      }
    })();
  }, [selectedBranch]);

  // ------------- DataGrid columns -------------
  const columns = useMemo(
    () => [
      { field: "label", headerName: "Seri / Grup", flex: 1.2 },
      { field: "kind", headerName: "Tür", flex: 1 },
      { field: "state", headerName: "Durum", flex: 0.8 },
      { field: "imei", headerName: "IMEI", flex: 1 },
      { field: "wan_ip", headerName: "WAN IP", flex: 1 },
      {
        field: "history",
        headerName: "Geçmiş",
        sortable: false,
        width: 90,
        renderCell: (params) =>
          !params.row.isGroup && (
            <Tooltip title="Geçmişi Gör">
              <IconButton
                size="small"
                onClick={() => setHistorySerial(params.row.serial_no)}
              >
                <HistoryIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ),
      },
    ],
    []
  );

  // ------------- handlers -------------
  const handleSelect = (ids) => {
    const serials = ids
      .map((id) => rows.find((r) => r.id === id))
      .filter((r) => r && !r.isGroup)
      .map((r) => r.serial_no);
    setSelectedSerials(serials);
  };
  const handleRowSelection = (ids) => {
    // yalnızca yaprak (parça) satırlarının seri numaralarını topla
    const serials = ids
      .map((id) => rows.find((r) => r.id === id))
      .filter((r) => r && !r.isGroup)
      .map((r) => r.serial_no);

    setSelectedSerials(serials);
  };
  const handleDismount = async () => {
    try {
      await dismountParts(selectedSerials, "UI demontaj");
      setSnackbar({ severity: "success", msg: "Parçalar depoya alındı" });
      setRows((prev) =>
        prev.map((r) =>
          selectedSerials.includes(r.serial_no)
            ? { ...r, state: "warehouse" }
            : r
        )
      );
      setSelectedSerials([]);
    } catch {
      setSnackbar({ severity: "error", msg: "İşlem başarısız" });
    }
  };
  return (
    <Card as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <CardHeader
        title={<Typography variant="h6">Parça Yönetimi</Typography>}
        action={<Chip label="Tree" color="primary" />}
      />

      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Branch seçimi ve aksiyon butonu */}
        <Box display="flex" gap={2} alignItems="center">
          <Autocomplete
            sx={{ minWidth: 280 }}
            options={branches}
            loading={branchLoading}
            value={selectedBranch}
            getOptionLabel={(opt) => opt.name || ""}
            onChange={(_, v) => setSelectedBranch(v)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Şube Seç"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {branchLoading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <Button
            variant="contained"
            startIcon={<DeleteIcon />}
            disabled={selectedSerials.length === 0}
            onClick={handleDismount}
          >
            Depoya Kaldır ({selectedSerials.length})
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Ağaç grid */}
        <Box sx={{ height: 540 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            treeData
            getTreeDataPath={(row) => row.path}
            groupingColDef={{ headerName: "", width: 60 }}
            defaultGroupingExpansionDepth={0}
            getRowId={(row) => row.id}
            checkboxSelection
            disableRowSelectionOnClick
            density="comfortable"
            onRowSelectionModelChange={handleRowSelection}
          />
        </Box>

        {/* Geçmiş modalı */}
        {historySerial && (
          <HistoryModal
            open
            serial={historySerial}
            onClose={() => setHistorySerial(null)}
          />
        )}

        {/* Snackbar uyarısı */}
        <Snackbar
          open={Boolean(snackbar)}
          autoHideDuration={4000}
          onClose={() => setSnackbar(null)}
        >
          {snackbar && (
            <Alert
              onClose={() => setSnackbar(null)}
              severity={snackbar.severity}
              variant="filled"
            >
              {snackbar.msg}
            </Alert>
          )}
        </Snackbar>
      </CardContent>
    </Card>
  );
}
