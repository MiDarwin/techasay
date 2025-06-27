// src/components/BpetErrorHistoryModal.tsx
import { Fragment, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Stack,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorIcon from "@mui/icons-material/Error";
import { getErrorsByBpet, type ErrorSummary } from "../../utils/api";

interface Props {
  bpetId: number | null; // null ⇒ kapalı
  onClose: () => void;
}

export default function BpetErrorHistoryModal({ bpetId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ErrorSummary[]>([]);
  const [formattedDates, setFormattedDates] = useState<Record<number, string>>(
    {}
  );

  /* severity → ikon + renk */
  const sevProps = (sev?: string) =>
    sev === "critical"
      ? { icon: <ErrorIcon />, color: "error" as const }
      : sev === "warning"
      ? { icon: <WarningAmberIcon />, color: "warning" as const }
      : { icon: <InfoIcon />, color: "info" as const };

  /* Modal açıldığında veriyi getir */
  useEffect(() => {
    if (!bpetId) return;

    (async () => {
      setLoading(true);
      try {
        const data = await getErrorsByBpet(bpetId, 100);
        setList(data);

        // Tarihleri formatla ve kaydet
        const dates: Record<number, string> = {};
        data.forEach((e) => {
          dates[e.id] = formatDate(e.occurred_at ?? e.occurredAt);
        });
        setFormattedDates(dates);
      } finally {
        setLoading(false);
      }
    })();
  }, [bpetId]);

  // Tarih formatlama fonksiyonu
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";

    // Tarih nesnesi oluştur
    const date = new Date(dateStr);

    // Geçerli bir tarih mi kontrol et
    if (isNaN(date.getTime())) return "—";

    // TR locale ile formatla
    return date.toLocaleString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={!!bpetId} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Bpet Hata Geçmişi</DialogTitle>

      <DialogContent dividers sx={{ minHeight: 200 }}>
        {loading ? (
          <Stack alignItems="center" mt={4}>
            <CircularProgress />
          </Stack>
        ) : list.length === 0 ? (
          <Alert severity="info">Bu BPET için kayıtlı hata yok.</Alert>
        ) : (
          <List dense>
            {list.map((e, idx) => {
              const { icon, color } = sevProps(e.severity);

              return (
                <Fragment key={e.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>

                    <ListItemText
                      primary={
                        <Chip
                          label={e.severity ?? "info"}
                          size="small"
                          color={color}
                          sx={{ mr: 1 }}
                        />
                      }
                      secondary={
                        <>
                          {/* Tarih */}
                          <Typography
                            variant="subtitle2"
                            component="span"
                            display="block"
                          >
                            {formattedDates[e.id] ||
                              formatDate(e.occurred_at ?? e.occurredAt)}
                          </Typography>

                          {/* Açıklama */}
                          <Typography
                            variant="body2"
                            component="span"
                            display="block"
                          >
                            {e.description}
                          </Typography>

                          {/* Not (varsa) */}
                          {e.notes && (
                            <Typography
                              variant="caption"
                              component="span"
                              color="text.secondary"
                              display="block"
                            >
                              Not:&nbsp;{e.notes}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>

                  {idx < list.length - 1 && <Divider component="li" />}
                </Fragment>
              );
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Kapat</Button>
      </DialogActions>
    </Dialog>
  );
}
