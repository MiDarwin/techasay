import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Button,
  Tooltip,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { DataGrid, GridRowSelectionModel } from "@mui/x-data-grid";
import HistoryIcon from "@mui/icons-material/History";
import RouterIcon from "@mui/icons-material/Router";
import SimIcon from "@mui/icons-material/SimCard";
import NetworkWifiIcon from "@mui/icons-material/NetworkWifi";
import AntennaIcon from "@mui/icons-material/SettingsInputAntenna";

import {
  getBpetsByBranch,
  getBpetsInWarehouse,
  bulkDismountBpets,
} from "../../utils/api";
import BpetHistoryModal from "./BpetHistoryModal";

/* İkon haritası */
const icons: Record<string, JSX.Element> = {
  modem: <RouterIcon color="primary" />,
  "gsm anten": <AntennaIcon color="secondary" />,
  "gsm anten güçelndiirlmiş a": <AntennaIcon color="secondary" />,
  sim: <SimIcon color="action" />,
  "wifi anteni": <NetworkWifiIcon color="action" />,
};

interface Props {
  branchId: number;
}

export default function BpetList({ branchId }: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyId, setHistoryId] = useState<number | null>(null);
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>({
      type: "include",
      ids: new Set<number>(),
    });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const selectedCount = rowSelectionModel.ids.size;

  /* fetch */
  const fetchRows = async () => {
    setLoading(true);
    try {
      const data =
        branchId === null
          ? await getBpetsInWarehouse()
          : await getBpetsByBranch(branchId);
      setRows(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRows();
  }, [branchId]);

  const columns = [
    {
      field: "product_name",
      headerName: "Ürün",
      flex: 1,
    },
    {
      field: "attributes",
      headerName: "Özellikler",
      flex: 2,
      renderCell: (params) => {
        const attrs = params.value as Record<string, any>;
        return (
          <Box>
            {Object.entries(attrs).map(([key, val]) => (
              <Typography variant="body2" key={key}>
                <strong>{key}:</strong> {val}
              </Typography>
            ))}
          </Box>
        );
      },
    },
    {
      field: "created_at",
      headerName: "Eklenme Tarihi",
      width: 130,
      // renderCell veya valueFormatter ikisinden biri
      renderCell: (params) => {
        const date = new Date(params.value as string);
        return date.toLocaleDateString("tr-TR"); // sadece gün/ay/yıl
      },
    },
    {
      field: "actions",
      headerName: "İşlemler",
      width: 120,
      renderCell: (params) => (
        <Button onClick={() => setHistoryId(params.row.id)}>Geçmiş</Button>
      ),
    },
  ];
  const handleBulkDismount = async () => {
    const idsArray = Array.from(rowSelectionModel.ids);
    try {
      await bulkDismountBpets(idsArray, "");
      // başarı mesajı
      setRowSelectionModel({ type: "include", ids: new Set() }); // seçimleri temizle
      fetchRows();
    } catch {
      setSnackbar({
        open: true,
        message: "Depoya taşıma başarısız oldu.",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetchRows();
  }, [branchId]);
  if (loading) {
    return (
      <Box textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  if (!loading && rows.length === 0) {
    return <Typography>Depoda BPET bulunamadı.</Typography>;
  }

  return (
    <>
      <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
        <Button
          variant="contained"
          color="warning"
          disabled={selectedCount === 0}
          onClick={handleBulkDismount}
        >
          Toplu Depoya Kaldır ({selectedCount})
        </Button>
      </Box>
      <Box sx={{ height: 500 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={(newModel) => {
            console.log("Yeni seçilenler:", newModel);
            setRowSelectionModel(newModel);
          }}
          loading={loading}
          showToolbar
        />
      </Box>
      {historyId && (
        <BpetHistoryModal
          open={Boolean(historyId)}
          bpetId={historyId}
          onClose={() => setHistoryId(null)}
        />
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
