import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { DataGrid, GridRowSelectionModel } from "@mui/x-data-grid";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import {
  getBpetsByBranch,
  getBpetsInWarehouse,
  bulkDismountBpets,
  updateBpet,
  getBranchesByCompanyId,
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
  companyId: number; // şirket ID
  onSelectionChange?: (selectedIds: number[]) => void;
  refreshKey?: number;
}

const BpetList: React.FC<BpetListProps> = ({
  branchId,
  onSelectionChange,
  refreshKey,
}) => {
  const [rows, setRows] = useState<BpetRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyId, setHistoryId] = useState<number | null>(null);
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>({
      type: "include",
      ids: new Set<number>(),
    });
  const selectedCount = rowSelectionModel.ids.size;

  const [formOpen, setFormOpen] = useState(false);
  const [editBpet, setEditBpet] = useState<BpetRow | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Depodan şubeye gönderme modal
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendId, setSendId] = useState<number | null>(null);
  const [branchesOptions, setBranchesOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedSendBranch, setSelectedSendBranch] = useState<number | null>(
    null
  );

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
    // Şube listesi fetch
    getBranchesByCompanyId(3).then((list) => setBranchesOptions(list));
  }, [branchId, refreshKey]);

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

  // Depodan şubeye gönder
  const handleSend = async () => {
    if (!sendId || !selectedSendBranch) return;
    try {
      await updateBpet(sendId, { branch_id: selectedSendBranch });
      setSnackbar({
        open: true,
        message: "BPET şubeye gönderildi.",
        severity: "success",
      });
      setSendModalOpen(false);
      setSendId(null);
      setSelectedSendBranch(null);
      fetchRows();
    } catch (e) {
      setSnackbar({
        open: true,
        message: "Gönderme başarısız oldu.",
        severity: "error",
      });
    }
  };
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
      width: 160,
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
          {branchId === null && (
            <IconButton
              size="small"
              onClick={() => {
                setSendId(params.row.id);
                setSendModalOpen(true);
              }}
            >
              <SendIcon />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  return (
    <>
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

      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : rows.length === 0 ? (
        <Typography>Bu listede BPET bulunamadı.</Typography>
      ) : (
        <Box
          sx={{
            height: 500,
            "& .even-row": { backgroundColor: "rgba(235, 235, 235, 0.6)" },
            "& .odd-row": { backgroundColor: "#ffffff" },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(200,200,200,0.4)",
            },
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            checkboxSelection
            disableRowSelectionOnClick
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={(model) => {
              setRowSelectionModel(model);
              onSelectionChange?.(Array.from(model.ids));
            }}
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0
                ? "even-row"
                : "odd-row"
            }
            sx={{ border: "none", fontSize: "0.9rem" }}
          />
        </Box>
      )}

      {historyId && (
        <BpetHistoryModal
          open={Boolean(historyId)}
          bpetId={historyId}
          onClose={() => setHistoryId(null)}
        />
      )}
      {formOpen && (
        <BpetForm
          open={formOpen}
          branchId={branchId}
          bpetToEdit={editBpet ?? undefined}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}

      <Dialog
        open={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Depodan Şubeye Gönder</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Hedef Şube"
            value={selectedSendBranch ?? ""}
            onChange={(e) => setSelectedSendBranch(Number(e.target.value))}
            SelectProps={{ native: true }}
            fullWidth
          >
            <option value="">Şube seçin</option>
            {branchesOptions.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendModalOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!selectedSendBranch}
            onClick={handleSend}
          >
            Gönder
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BpetList;
