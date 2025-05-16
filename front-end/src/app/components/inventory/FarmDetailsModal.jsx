import React from "react";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { TreeView, TreeItem } from "@mui/lab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";

export default function FarmDetailsModal({ open, onClose, inv }) {
  if (!inv) return null;

  /* 1️⃣  prefix (sensör) → { alan: değer } şeklinde grupla */
  const grouped = {};
  Object.entries(inv.details || {}).forEach(([key, value]) => {
    const [sensor, field] = key.split("_", 2); // TH1_AppEUI → TH1 / AppEUI
    if (!grouped[sensor]) grouped[sensor] = {};
    grouped[sensor][field] = value;
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        {inv.branch_name} – Tüm Sensörler
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {/* 2️⃣  Ağaç görünümü */}
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          sx={{ flexGrow: 1, overflowY: "auto", p: 1 }}
        >
          {Object.entries(grouped).map(([sensor, fields]) => (
            <TreeItem nodeId={sensor} label={sensor} key={sensor}>
              {Object.entries(fields).map(([field, val]) => (
                <TreeItem
                  nodeId={`${sensor}_${field}`}
                  key={`${sensor}_${field}`}
                  label={
                    <span>
                      <strong>{field}</strong>: {val}
                    </span>
                  }
                />
              ))}
            </TreeItem>
          ))}
        </TreeView>
      </DialogContent>
    </Dialog>
  );
}
