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
            <TableCell>Adres</TableCell>
            <TableCell>Şehir</TableCell>
            <TableCell>Telefon Numarası</TableCell>
            <TableCell>Şube Notu</TableCell>
            <TableCell>Konum Linki</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Alt şubeler verilerini satır olarak render et */}
          {subBranches.map((branch) => (
            <TableRow key={branch.id}>
              <TableCell>{branch.id}</TableCell>
              <TableCell>{branch.name}</TableCell>
              <TableCell>{branch.address || "Bilgi Yok"}</TableCell>
              <TableCell>{branch.city || "Bilgi Yok"}</TableCell>
              <TableCell>{branch.phone_number || "Bilgi Yok"}</TableCell>
              <TableCell>{branch.branch_note || "Bilgi Yok"}</TableCell>
              <TableCell>
                {branch.location_link ? (
                  <a
                    href={branch.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Linke Git
                  </a>
                ) : (
                  "Bilgi Yok"
                )}
              </TableCell>
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
      name: PropTypes.string.isRequired,
      address: PropTypes.string,
      city: PropTypes.string,
      phone_number: PropTypes.string,
      branch_note: PropTypes.string,
      location_link: PropTypes.string,
    })
  ).isRequired,
};

export default SubBranchTable;
