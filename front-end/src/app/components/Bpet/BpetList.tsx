import React, { useEffect, useState, useMemo } from "react";
import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getBpetsByBranch } from "../../utils/api";
function BpetList({ branchId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!branchId) return;
    (async () => {
      setLoading(true);
      try {
        const data = await getBpetsByBranch(branchId);

        // attributes objesini "key: value" formatında tek stringe çeviriyoruz
        const formatted = data.map((b, idx) => ({
          // b.id artık kesin var
          id: b.id,
          product_name: b.product_name,
          attributes: Object.entries(b.attributes)
            .map(([key, val]) => `${key}: ${val}`)
            .join(" | "),
          branch_name: b.branch_name,
          branch_id: b.branch_id,
          created_at: new Date(b.created_at).toLocaleString(),
        }));

        setRows(formatted);
      } finally {
        setLoading(false);
      }
    })();
  }, [branchId]);

  const columns = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 70 },
      { field: "product_name", headerName: "Ürün", flex: 1 },
      { field: "attributes", headerName: "Özellikler", flex: 2 },
      { field: "branch_name", headerName: "Şube", flex: 1 },
      { field: "branch_id", headerName: "Şube ID", width: 100 },
      { field: "created_at", headerName: "Eklenme", flex: 1.2 },
    ],
    []
  );

  return (
    <Box sx={{ height: 500 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSize={10}
        getRowId={(row) => row.id} // unique id’yi burada tanımlıyoruz
      />
    </Box>
  );
}

export default BpetList;
