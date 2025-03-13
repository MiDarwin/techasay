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
      sx={{ borderRadius: "8px", boxShadow: 3 }}
    >
      <Table>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "#1976d2",
              color: "#ffffff",
              "& th": {
                fontWeight: "bold",
                fontSize: "1.1rem",
              },
            }}
          >
            <TableCell>Şube Adı</TableCell>
            <TableCell>Alt Şube Adı</TableCell>{" "}
            {/* Alt şube adı için yeni hücre */}
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
              <TableCell colSpan={7} align="center">
                {" "}
                {/* Kolon sayısını güncelledik */}
                <Typography>Envanter bulunamadı.</Typography>
              </TableCell>
            </TableRow>
          ) : (
            inventories.map((inventory, index) => (
              <TableRow
                key={inventory.id}
                sx={{
                  backgroundColor: index % 2 === 0 ? "#f7f9fc" : "#ffffff",
                  "&:hover": {
                    backgroundColor: "#e3f2fd",
                  },
                }}
              >
                <TableCell>{inventory.branch_name}</TableCell>
                <TableCell>{inventory.sub_branch_name || "Yok"}</TableCell>{" "}
                {/* Alt şube adı */}
                <TableCell>{inventory.device_type}</TableCell>
                <TableCell>{inventory.device_model}</TableCell>
                <TableCell>{inventory.quantity}</TableCell>
                <TableCell>{inventory.note}</TableCell>
                <TableCell>
                  <Tooltip title="Düzenle">
                    <IconButton
                      onClick={() => onEdit(inventory)}
                      color="warning"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Sil">
                    <IconButton
                      onClick={() => onDelete(inventory.id)}
                      color="error"
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
