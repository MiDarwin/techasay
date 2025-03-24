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
const CompanyTable = ({ companies, onEdit, onDelete }) => {
  const [permissions, setPermissions] = useState([]); // Kullanıcı izinleri

  return (
    <TableContainer
      component={Paper}
      sx={{ borderRadius: "8px", boxShadow: 3 }}
    >
      <Table>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "#bf8f6b",
              color: "#ffffff",
              "& th": {
                fontWeight: "bold",
                fontSize: "1.1rem",
              },
            }}
          >
            <TableCell>Şirket ID</TableCell>
            <TableCell>Şirket Adı</TableCell>
            <TableCell>İşlemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {companies.map((company, index) => (
            <TableRow
              key={company.name}
              sx={{
                backgroundColor: index % 2 === 0 ? "#EDE8DC" : "#C1CFA1",
                "&:hover": {
                  backgroundColor: "#dfedbe",
                },
              }}
            >
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
