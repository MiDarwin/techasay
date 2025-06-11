import React, { useEffect, useMemo, useState } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import HistoryIcon from "@mui/icons-material/History";
import RouterIcon from "@mui/icons-material/Router";
import SimIcon from "@mui/icons-material/SimCard";
import NetworkWifiIcon from "@mui/icons-material/NetworkWifi";
import AntennaIcon from "@mui/icons-material/SettingsInputAntenna";

import { getBpetsByBranch } from "../../utils/api";
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
    if (!branchId) return;
    (async () => {
      setLoading(true);
      try {
        const data = await getBpetsByBranch(branchId);
        setRows(
          data.map((b: any) => ({
            id: b.id,
            icon: icons[b.product_name.toLowerCase()] ?? null,
            product_name: b.product_name,
            attributes: JSON.stringify(b.attributes),
            created_at: new Date(b.created_at).toLocaleDateString(),
          }))
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [branchId]);

  const columns = useMemo(
    () => [
      {
        field: "icon",
        headerName: "",
        width: 60,
        sortable: false,
        renderCell: (p: any) => p.row.icon,
      },
      { field: "product_name", headerName: "Ürün", flex: 1 },
      { field: "attributes", headerName: "Özellikler", flex: 2 },
      { field: "created_at", headerName: "Eklenme", flex: 1 },
      {
        field: "history",
        headerName: "",
        width: 80,
        sortable: false,
        renderCell: (p: any) => (
          <Tooltip title="Geçmiş">
            <IconButton size="small" onClick={() => setHistoryId(p.row.id)}>
              <HistoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    []
  );

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
