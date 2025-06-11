import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import { DataGrid, GridRowSelectionModel } from "@mui/x-data-grid";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";
import {
  getBpetsByBranch,
  getBpetsInWarehouse,
  bulkDismountBpets,
} from "../../utils/api";
import BpetHistoryModal from "./BpetHistoryModal";
import BpetForm from "./BpetForm";

interface BpetRow {
  id: number;
  product_name: string;
  attributes: Record<string, any>;
  created_at: string;
}

interface BpetListProps {
  branchId: number | null;
}

const BpetList: React.FC<BpetListProps> = ({ branchId }) => {
  const [rows, setRows] = useState<BpetRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyId, setHistoryId] = useState<number | null>(null);
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>({
      type: "include",
      ids: new Set<number>(),
    });
  const [formOpen, setFormOpen] = useState(false);
  const [editBpet, setEditBpet] = useState<BpetRow | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Fetch rows
  const fetchRows = async () => {
    setLoading(true);
    try {
      const data =
        branchId === null
          ? await getBpetsInWarehouse()
          : await getBpetsByBranch(branchId);
      setRows(data);
    } catch (e) {
      console.error(e);
      setSnackbar({
        open: true,
        message: "Veri yüklenirken hata oluştu.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, [branchId]);

  // Bulk dismount handler omitted for brevity

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditBpet(null);
  };
  const handleSuccess = () => {
    setSnackbar({
      open: true,
      message: editBpet ? "BPET güncellendi." : "BPET oluşturuldu.",
      severity: "success",
    });
    handleCloseForm();
    fetchRows();
  };

  const columns = [
    { field: "product_name", headerName: "Ürün", flex: 1 },
    {
      field: "attributes",
      headerName: "Özellikler",
      flex: 2,
      renderCell: (params: any) => (
        <Box>
          {Object.entries(params.value).map(([k, v]) => (
            <Typography variant="body2" key={k}>
              <strong>{k}:</strong> {v}
            </Typography>
          ))}
        </Box>
      ),
    },
    {
      field: "created_at",
      headerName: "Eklenme Tarihi",
      width: 130,
      renderCell: (params: any) =>
        new Date(params.value).toLocaleDateString("tr-TR"),
    },
    {
      field: "actions",
      headerName: "İşlemler",
      width: 120,
      sortable: false,
      renderCell: (params: any) => (
        <Box>
          <IconButton size="small" onClick={() => setHistoryId(params.row.id)}>
            <HistoryIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setEditBpet(params.row);
              setFormOpen(true);
            }}
          >
            <EditIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <>
      {/* Snackbar */}
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

      {/* Loading / Empty / Table */}
      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : rows.length === 0 ? (
        <Typography>Bu listede BPET bulunamadı.</Typography>
      ) : (
        <Box sx={{ height: 500 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            checkboxSelection
            disableRowSelectionOnClick
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={(model) => setRowSelectionModel(model)}
          />
        </Box>
      )}

      {/* History Modal */}
      {historyId && (
        <BpetHistoryModal
          open={Boolean(historyId)}
          bpetId={historyId}
          onClose={() => setHistoryId(null)}
        />
      )}

      {/* Edit/Create Form */}
      {formOpen && (
        <BpetForm
          open={formOpen}
          branchId={branchId}
          bpetToEdit={editBpet ?? undefined}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default BpetList;
