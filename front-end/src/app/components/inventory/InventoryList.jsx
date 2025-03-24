import React, { useEffect, useState } from "react";
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
import { getAllUsersPermissions } from "@/app/utils/api";
import tableStyles from "../../styles/tableStyles";

const InventoryList = ({ inventories, onEdit, onDelete }) => {
  const [permissions, setPermissions] = useState([]); // Kullanıcı izinleri
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const userPermissions = await getAllUsersPermissions(); // Kullanıcı izinlerini al
        setPermissions(userPermissions); // İzinleri state'e ata
      } catch (error) {
        console.error("Kullanıcı izinleri alınırken hata oluştu:", error);
      }
    };

    fetchPermissions();
  }, []);
  return (
    <TableContainer component={Paper} sx={tableStyles.tableContainer}>
      <Table>
        <TableHead>
          <TableRow sx={tableStyles.tableHeader}>
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
                    backgroundColor: "#dfedbe", // Hover rengi
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
                  {inventory.specs}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {permissions.includes("inventoryEdit") && (
                    <Tooltip title="Düzenle">
                      <IconButton
                        onClick={() => onEdit(inventory)}
                        color="warning"
                        aria-label="Düzenle"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {permissions.includes("inventoryDelete") && (
                    <Tooltip title="Sil">
                      <IconButton
                        onClick={() => onDelete(inventory.id)}
                        color="error"
                      >
                        <NoBackpackIcon />
                      </IconButton>
                    </Tooltip>
                  )}
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
