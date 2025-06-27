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
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid, GridRowSelectionModel, GridToolbar } from "@mui/x-data-grid";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import {
  getBpetsByBranch,
  getBpetsInWarehouse,
  bulkDismountBpets,
  updateBpet,
  getBranchesByCompanyId,
  getErrorsByBpet,
} from "../../utils/api";
import BpetHistoryModal from "./BpetHistoryModal";
import AddAlertIcon from "@mui/icons-material/AddAlert"; // ikon serbest
import BpetErrorModal from "./BpetErrorModal"; // yolu kendine göre
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import BpetForm from "./BpetForm";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import RouterIcon from "@mui/icons-material/Router"; // modem
import SensorsIcon from "@mui/icons-material/Sensors"; // sensör
import SimCardIcon from "@mui/icons-material/SimCard"; // sim
import DeviceUnknownIcon from "@mui/icons-material/Devices"; // varsayılan
import BpetErrorHistoryModal from "./BpetErrorHistoryModal"; // yolu kendine göre düzelt
const getProductIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("modem")) return <RouterIcon color="primary" />;
  if (n.includes("sensor") || n.includes("sensör"))
    return <SensorsIcon color="info" />;
  if (n.includes("sim")) return <SimCardIcon color="warning" />;
  return <DeviceUnknownIcon color="disabled" />;
};

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
  bumpRefresh?: () => void;
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
  const [errorModalBpetId, setErrorModalBpetId] = useState<number | null>(null);
  const selectedCount = rowSelectionModel.ids.size;
  type ErrorCacheEntry = ErrorSummary[] | null; // dizi veya null
  const [errorPreview, setErrorPreview] = useState<
    Record<number, ErrorCacheEntry>
  >({});
  const [historyModalId, setHistoryModalId] = useState<number | null>(null);

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
  const loadErrors = async (id: number) => {
    if (errorPreview[id] !== undefined) return; // cache var
    try {
      const list = await getErrorsByBpet(id, 5); // imza uyumlu
      setErrorPreview((p) => ({ ...p, [id]: list.length ? list : null }));
    } catch (err) {
      console.error(err);
      setErrorPreview((p) => ({ ...p, [id]: null }));
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
    return <Typography color="black">Depoda BPET bulunamadı.</Typography>;
  }
  const columns = [
    {
      field: "product_name",
      headerName: "Ürün",
      flex: 1,
      renderCell: ({ value }) => (
        <Box display="flex" alignItems="center" gap={1}>
          {getProductIcon(value)}
          <Typography fontWeight={600}>{value}</Typography>
        </Box>
      ),
    },
    {
      field: "attributes",
      headerName: "Özellikler",
      flex: 2,
      renderCell: ({ value }) => {
        /* value ⇒ { adet:1, ip:"10.0.0.1", seri:"ABC123", ... } */
        const entries = Object.entries(value);
        const shown = entries.slice(0, 3); // ilk 3 özellik
        const hidden = entries.slice(3); // fazlası

        return (
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {shown.map(([k, v]) => (
              <Chip
                key={k}
                size="small"
                label={`${k}: ${v}`}
                color="info"
                variant="filled"
              />
            ))}

            {hidden.length > 0 && (
              <Tooltip
                arrow
                title={hidden.map(([k, v]) => `${k}: ${v}`).join(" • ")}
              >
                <Chip
                  size="small"
                  label={`+${hidden.length}`}
                  variant="outlined"
                />
              </Tooltip>
            )}
          </Stack>
        );
      },
    },
    {
      field: "created_at",
      headerName: "Eklenme Tarihi",
      width: 130,
      renderCell: (params: any) =>
        new Date(params.value).toLocaleDateString("tr-TR"),
    },
    {
      field: "errorInfo",
      headerName: "Hata Bilgileri",
      width: 180,
      sortable: false,
      renderCell: (params: any) => {
        const id = params.row.id;
        const list = errorPreview[id];
        const hasErrors = Array.isArray(list) && list.length > 0;

        return (
          <Box>
            {/* Tooltip + InfoIcon */}
            <Tooltip
              arrow
              title={
                list === undefined ? (
                  "Yükleniyor…"
                ) : !hasErrors ? (
                  "Bu BPET için kayıtlı hata yok"
                ) : (
                  <Box>
                    {list
                      .filter(Boolean)
                      .slice(0, 5)
                      .map((e) => {
                        const d = e.occurred_at ?? e.occurredAt;
                        const date = d
                          ? new Date(d).toLocaleDateString("tr-TR")
                          : "—";
                        return (
                          <Typography key={e.id} variant="body2">
                            {date} {" — "} {e.description ?? "—"}
                          </Typography>
                        );
                      })}
                  </Box>
                )
              }
            >
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); // 🛑 satır tıklamasını durdur
                  setHistoryModalId(id); // modalı aç
                }}
                onMouseEnter={() => loadErrors(id)}
                onFocus={() => loadErrors(id)}
              >
                <InfoIcon color={hasErrors ? "error" : "disabled"} />
              </IconButton>
            </Tooltip>

            <Tooltip arrow title="Hata Ekle">
              <IconButton
                size="small"
                onClick={() => setErrorModalBpetId(id)}
                color="success"
                sx={{ ml: 0.5 }}
              >
                <ReportProblemIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "İşlemler",
      width: 200, // ikon sayısı arttıysa biraz genişlettim
      sortable: false,
      renderCell: (params: any) => {
        const id = params.row.id;
        const list = errorPreview[id];
        const hasErrors = Array.isArray(list) && list.length > 0;

        return (
          <Box>
            {/* DİĞER ESKİ BUTONLAR */}
            <IconButton size="small" onClick={() => setHistoryId(id)}>
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
                  setSendId(id);
                  setSendModalOpen(true);
                }}
              >
                <SendIcon />
              </IconButton>
            )}
          </Box>
        );
      },
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
            pagination
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
            pageSizeOptions={[10, 25, 50]}
            checkboxSelection
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                csvOptions: { fileName: "bpet-listesi" },
              },
            }}
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={(m) => {
              setRowSelectionModel(m);
              onSelectionChange?.(Array.from(m.ids));
            }}
            getRowClassName={(p) =>
              p.indexRelativeToCurrentPage % 2 === 0 ? "even-row" : "odd-row"
            }
            sx={{
              border: "none",
              fontSize: "0.9rem",
              "& .even-row": { backgroundColor: "rgba(235,235,235,0.6)" },
              "& .odd-row": { backgroundColor: "#fff" },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "rgba(200,200,200,0.4)",
              },
              "& .MuiDataGrid-cell": {
                display: "flex",
                alignItems: "center",
              },
            }}
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
      <BpetErrorModal
        bpetId={errorModalBpetId}
        bpetname={
          rows.find((r) => r.id === errorModalBpetId)?.product_name ?? ""
        }
        onClose={(created) => {
          setErrorModalBpetId(null);
          if (created) {
            // isteğe bağlı: mevcut satır tooltip cache’ini temizle
            setErrorPreview((p) => ({ ...p, [errorModalBpetId!]: undefined }));
          }
        }}
      />
      <BpetErrorHistoryModal
        bpetId={historyModalId}
        onClose={() => setHistoryModalId(null)}
      />
      <Dialog
        open={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Depodan Şubeye Gönder</DialogTitle>

        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            {/* Etiket */}
            <InputLabel id="send-branch-label">Hedef Şube</InputLabel>

            {/* Select */}
            <Select
              labelId="send-branch-label"
              label="Hedef Şube"
              value={selectedSendBranch ?? ""}
              onChange={(e) => setSelectedSendBranch(Number(e.target.value))}
            >
              <MenuItem value="">
                <em>Şube seçin</em>
              </MenuItem>

              {branchesOptions.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
