import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import HistoryIcon from "@mui/icons-material/History";
import { getBpetHistory } from "../../utils/api";

interface Props {
  open: boolean;
  bpetId: number;
  onClose: () => void;
}

export default function HistoryModal({ open, bpetId, onClose }: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const data = await getBpetHistory(bpetId);

        const toDate = (iso: string | null) =>
          iso ? new Date(iso).toLocaleDateString() : "-";

        const diffDays = (s: string, e: string | null) =>
          e ? Math.ceil((+new Date(e) - +new Date(s)) / 86400000) : "∑";

        setRows(
          data.map((r: any) => ({
            id: r.id,
            branch: r.branch_id ?? "Depo",
            state: r.state,
            start: toDate(r.started_at),
            end: toDate(r.ended_at),
            days: diffDays(r.started_at, r.ended_at),
          }))
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [open, bpetId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <HistoryIcon fontSize="small" sx={{ mr: 1 }} /> BPET #{bpetId} – Geçmiş
      </DialogTitle>
      <DialogContent dividers sx={{ height: 360 }}>
        <DataGrid
          rows={rows}
          loading={loading}
          density="compact"
          pageSize={5}
          columns={[
            { field: "state", headerName: "Durum", flex: 1 },
            { field: "branch", headerName: "Şube", flex: 1 },
            { field: "start", headerName: "Başlangıç", flex: 1 },
            { field: "end", headerName: "Bitiş", flex: 1 },
            { field: "days", headerName: "Gün", width: 80 },
          ]}
          disableRowSelectionOnClick
        />
      </DialogContent>
    </Dialog>
  );
}
