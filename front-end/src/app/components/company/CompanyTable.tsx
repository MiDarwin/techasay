import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getAllUsersPermissions } from "@/app/utils/api";
import tableStyles from "@/app/styles/tableStyles";

const CompanyTable = ({ companies, onEdit, onDelete }) => {
  const [permissions, setPermissions] = useState([]); // Kullanıcı izinleri

  return (
    <TableContainer component={Paper} sx={tableStyles.tableContainer}>
      <Table>
        <TableHead>
          <TableRow sx={tableStyles.tableHeader}>
            <TableCell>Şirket ID</TableCell>
            <TableCell>Şirket Adı</TableCell>
            <TableCell>İşlemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {companies.map((company, index) => (
            <TableRow key={company.name} sx={tableStyles.tableRow}>
              <TableCell>{company.company_id}</TableCell>
              <TableCell>{company.name}</TableCell>
              <TableCell>
                {permissions.includes("companyEdit") && (
                  <Tooltip title="Düzenle">
                    <IconButton onClick={() => onEdit(company)} color="warning">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {permissions.includes("companyDelete") && (
                  <Tooltip title="Sil">
                    <IconButton
                      onClick={() => onDelete(company.company_id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
          {companies.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                Hiç Şirket Bulunmuyor.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CompanyTable;
