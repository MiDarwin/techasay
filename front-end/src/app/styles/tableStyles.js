const tableStyles = {
  tableContainer: {
    borderRadius: "8px",
    boxShadow: "3px 3px 10px rgba(0, 0, 0.1)",
  },
  tableHeader: {
    backgroundColor: "#E7F6F2",
    color: "#ffffff",
    "& th": {
      fontWeight: "bold",
      fontSize: "1.1rem",
    },
  },
  tableRow: {
    "&:nth-of-type(odd)": {
      backgroundColor: "#395B64", // Tek satırlar
    },
    "&:nth-of-type(even)": {
      backgroundColor: "#E7F6F2", // Çift satırlar
    },
    "&:hover": {
      backgroundColor: "#A5C9CA", // Hover efekti
    },
  },
  subBranchRow: {
    backgroundColor: "#EDE8DC", // Alt şube arka plan rengi
  },
};

export default tableStyles;
