import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

// Stil tanımlamaları için makeStyles kullanımı
const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  header: {
    backgroundColor: "#1976d2", // Başlık arka plan rengi (Mavi)
  },
  headerCell: {
    color: "#fff",
    fontWeight: "bold",
  },
  evenRow: {
    backgroundColor: "#f5f5f5", // Çift satır arka plan rengi (Açık gri)
    "&:hover": {
      backgroundColor: "#e0e0e0", // Hover durumunda daha koyu gri
    },
  },
  oddRow: {
    backgroundColor: "#ffffff", // Tek satır arka plan rengi (Beyaz)
    "&:hover": {
      backgroundColor: "#f0f0f0", // Hover durumunda daha koyu beyaz
    },
  },
  cell: {
    color: "#000",
  },
  button: {
    marginRight: "8px",
  },
  updateButton: {
    backgroundColor: "#f59e0b", // Sarı renk
    color: "#000",
    "&:hover": {
      backgroundColor: "#fdd835", // Hover durumunda daha koyu sarı
    },
  },
  deleteButton: {
    backgroundColor: "#f44336", // Kırmızı renk
    color: "#fff",
    "&:hover": {
      backgroundColor: "#d32f2f", // Hover durumunda daha koyu kırmızı
    },
  },
  noDataRow: {
    backgroundColor: "#ffffff",
  },
});

const CompanyTable = ({ companies, onEdit, onDelete }) => {
  const classes = useStyles();

  return (
    <TableContainer component={Paper} elevation={1}>
      <Table className={classes.table} aria-label="şirket tablosu">
        <TableHead className={classes.header}>
          <TableRow>
            <TableCell className={classes.headerCell}>ID</TableCell>
            <TableCell className={classes.headerCell}>Şirket ID</TableCell>
            <TableCell className={classes.headerCell}>Şirket Adı</TableCell>
            <TableCell className={classes.headerCell}>İşlemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {companies.map((company, index) => (
            <TableRow
              key={company._id}
              className={index % 2 === 0 ? classes.evenRow : classes.oddRow}
            >
              <TableCell className={classes.cell}>{company._id}</TableCell>
              <TableCell className={classes.cell}>
                {typeof company.company_id === "object"
                  ? JSON.stringify(company.company_id)
                  : company.company_id}
              </TableCell>
              <TableCell className={classes.cell}>
                {typeof company.name === "object"
                  ? `${company.name.first} ${company.name.last}`
                  : company.name}
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  className={`${classes.button} ${classes.updateButton}`}
                  onClick={() => onEdit(company)}
                >
                  Güncelle
                </Button>
                <Button
                  variant="contained"
                  className={classes.deleteButton}
                  onClick={() => onDelete(company._id)}
                >
                  Sil
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {companies.length === 0 && (
            <TableRow className={classes.noDataRow}>
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
