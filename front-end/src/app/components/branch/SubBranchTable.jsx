import React from "react";
import PropTypes from "prop-types"; // Prop validation için
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

const SubBranchTable = ({ subBranches }) => {
  return (
    <TableContainer component={Paper} sx={{ marginTop: 2 }}>
      {/* Başlık */}
      <Typography variant="h6" align="center" sx={{ padding: 2 }}>
        Alt Şube Detayları
      </Typography>

      {/* Tablo */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Şube Adı</TableCell>
            <TableCell>Şube Notu</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Alt şubeler verilerini satır olarak render et */}
          {subBranches.map((branch) => (
            <TableRow key={branch.id}>
              <TableCell>{branch.id}</TableCell>
              <TableCell>{branch.name}</TableCell>
              <TableCell>{branch.branch_note || "Bilgi Yok"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Prop Types
SubBranchTable.propTypes = {
  subBranches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      branch_name: PropTypes.string.isRequired,
      branch_note: PropTypes.string,
    })
  ).isRequired,
};

export default SubBranchTable;
