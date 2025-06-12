import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import { DataGrid, GridRowsProp } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import { getBpetHistory } from "../../utils/api";

interface HistoryModalProps {
  open: boolean;
  bpetId: number;
  onClose: () => void;
}

interface HistoryRow {
  id: number;
  state: string;
  branch: string;
  start: string;
  end?: string;
  days: number;
}

const BpetHistoryModal: React.FC<HistoryModalProps> = ({
  open,
  bpetId,
  onClose,
}) => {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getBpetHistory(bpetId)
      .then((data) => {
        const formatted = data.map((r: any) => ({
          id: r.id,
          state: r.state,
          branch: r.branch_name || "Depo",
          start: new Date(r.started_at).toLocaleString("tr-TR"),
          end: r.ended_at
            ? new Date(r.ended_at).toLocaleString("tr-TR")
            : "Devam ediyor",
          days: r.ended_at
            ? Math.round(
                (new Date(r.ended_at).getTime() -
                  new Date(r.started_at).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0,
        }));
        setRows(formatted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, bpetId]);

  const columns = [
    { field: "state", headerName: "Durum", flex: 1 },
    { field: "branch", headerName: "Şube", flex: 1 },
    { field: "start", headerName: "Başlangıç", flex: 1 },
    { field: "end", headerName: "Bitiş", flex: 1 },
    { field: "days", headerName: "Gün", width: 80 },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" alignItems="center">
          <HistoryIcon sx={{ mr: 1 }} />
          <Typography variant="h6">BPET #{bpetId} Geçmiş</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: 2,
          "& .even": { backgroundColor: "rgba(240, 240, 240, 0.7)" },
          "& .odd": { backgroundColor: "#fff" },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "rgba(200,200,200,0.4)",
          },
        }}
      >
        <Box sx={{ height: 360 }}>
          <DataGrid
            rows={rows as GridRowsProp}
            columns={columns}
            loading={loading}
            pageSize={5}
            density="compact"
            disableRowSelectionOnClick
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
            }
            sx={{ border: "none", fontSize: "0.9rem" }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default BpetHistoryModal;
