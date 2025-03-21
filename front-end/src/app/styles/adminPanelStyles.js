const adminPanelStyles = {
  container: {
    backgroundColor: "#F5F5F5",
    padding: "20px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: "2rem",
    color: "#333",
    marginBottom: "20px",
  },
  description: {
    fontSize: "1rem",
    color: "#666",
    textAlign: "center",
    marginBottom: "20px",
  },
  table: {
    width: "80%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  tableHeader: {
    fontSize: "1rem",
    color: "#FFF",
    backgroundColor: "#4CAF50",
    padding: "10px",
    textAlign: "center",
    border: "1px solid #ddd",
  },
  tableCell: {
    fontSize: "1rem",
    color: "#333",
    padding: "10px",
    textAlign: "center",
    border: "1px solid #ddd",
  },
  permissionButton: {
    fontSize: "0.9rem",
    color: "#FFF",
    padding: "5px",
    margin: "5px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
  },
};

export default adminPanelStyles;
