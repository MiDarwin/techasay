import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import NoBackpackIcon from "@mui/icons-material/NoBackpack";

const InventoryList = ({ inventories, onEdit, onDelete }) => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: "10px", // Köşeleri yuvarlat
        boxShadow: "0px 4px 10px rgba(0, 0, 0.2)", // Hafif gölge
        overflow: "hidden", // Taşmaları önle
      }}
    >
      <Table>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "#B17F59", // Başlık arka plan rengi
              "& th": {
                color: "#FFFFFF", // Başlık metin rengi
                fontWeight: "bold",
                fontSize: "1.1rem",
                textAlign: "center", // Başlık metinleri ortalanır
              },
            }}
          >
            <TableCell>Şube Adı</TableCell>
            <TableCell>Ürün Türü</TableCell>
            <TableCell>Ürün Modeli</TableCell>
            <TableCell>Miktar</TableCell>
            <TableCell>Ürün Notu</TableCell>
            <TableCell>İşlemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {inventories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography sx={{ color: "#6B7280" }}>
                  Envanter bulunamadı.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            inventories.map((inventory, index) => (
              <TableRow
                key={inventory.id ?? `inventory-${index}`}
                sx={{
                  backgroundColor: index % 2 === 0 ? "#EDE8DC" : "#C1CFA1", // Alternatif satır renkleri
                  "&:hover": {
                    backgroundColor: "#A5B68D", // Hover rengi
                  },
                }}
              >
                <TableCell sx={{ textAlign: "center" }}>
                  {inventory.branch_name}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {inventory.device_type}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {inventory.device_model}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {inventory.quantity}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {inventory.note}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Tooltip title="Düzenle">
                    <IconButton
                      onClick={() => onEdit(inventory)}
                      sx={{
                        color: "#B17F59", // Düzenle ikonu rengi
                        "&:hover": { color: "#8FA781" }, // Hover rengi
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Sil">
                    <IconButton
                      onClick={() => onDelete(inventory.id)}
                      sx={{
                        color: "#E57373", // Sil ikonu rengi
                        "&:hover": { color: "#D32F2F" }, // Hover rengi
                      }}
                    >
                      <NoBackpackIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InventoryList;
