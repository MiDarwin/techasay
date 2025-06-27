import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
} from "@mui/material";
import { ErrorCreate, addErrorToBpet } from "../../utils/api";

interface Props {
  bpetId: number | null; // null ⇒ kapalı
  onClose: (created?: boolean) => void;
}

export default function BpetErrorModal({ bpetId, onClose }: Props) {
  const [form, setForm] = useState<ErrorCreate>({
    description: "",
    severity: "info",
    occurred_at: "", // boş ⇒ backend now()
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange =
    (k: keyof ErrorCreate) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async () => {
    if (!bpetId) return;
    setLoading(true);
    try {
      await addErrorToBpet(bpetId, {
        ...form,
        occurred_at: form.occurred_at || undefined, // "" gönderme
        notes: form.notes || undefined,
      });
      onClose(true); // listeyi tazele vs.
    } catch (err) {
      console.error(err);
      alert("Kayıt eklenemedi 😢");
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!bpetId} onClose={() => onClose()}>
      <DialogTitle>Hata Ekle</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1, width: 400 }}>
          <TextField
            label="Açıklama"
            value={form.description}
            onChange={handleChange("description")}
            fullWidth
            required
            multiline
          />

          <TextField
            select
            label="Önem Düzeyi"
            value={form.severity}
            onChange={handleChange("severity")}
            fullWidth
          >
            {["info", "warning", "critical"].map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            type="datetime-local"
            label="Oluş Zamanı"
            value={form.occurred_at}
            onChange={handleChange("occurred_at")}
            fullWidth
            InputLabelProps={{ shrink: true }}
            helperText="Boş bırakırsan şimdi olarak kaydedilir"
          />

          <TextField
            label="Notlar"
            value={form.notes}
            onChange={handleChange("notes")}
            fullWidth
            multiline
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose()}>İptal</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !form.description.trim()}
        >
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
}
