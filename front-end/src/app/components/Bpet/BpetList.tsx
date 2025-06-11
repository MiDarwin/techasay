import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Button,
  Tooltip,
  Typography,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import HistoryIcon from "@mui/icons-material/History";
import RouterIcon from "@mui/icons-material/Router";
import SimIcon from "@mui/icons-material/SimCard";
import NetworkWifiIcon from "@mui/icons-material/NetworkWifi";
import AntennaIcon from "@mui/icons-material/SettingsInputAntenna";

import { getBpetsByBranch, getBpetsInWarehouse } from "../../utils/api";
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

  /* fetch */
  useEffect(() => {
    const fetch =
      branchId === null
        ? getBpetsInWarehouse
        : () => getBpetsByBranch(branchId);
    setLoading(true);
    fetch()
      .then(setRows)
      .catch((err) => {
        /* burada Snackbar/fallback ekle */
      })
      .finally(() => setLoading(false));
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
      <Box sx={{ height: 500 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSize={10}
          disableSelectionOnClick
        />
      </Box>
      {historyId && (
        <BpetHistoryModal
          open={Boolean(historyId)}
          bpetId={historyId}
          onClose={() => setHistoryId(null)}
        />
      )}
    </>
  );
}
