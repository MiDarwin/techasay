const settingsStyles = {
  container: {
    backgroundColor: "#F5F5F5",
    padding: "20px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: "2rem",
    color: "#333",
    marginBottom: "10px",
  },
  description: {
    fontSize: "1rem",
    color: "#666",
    textAlign: "center",
  },
  icon: {
    fontSize: "50px",
    color: "#A5B68D",
    cursor: "pointer",
    "&:hover": {
      color: "#8FA781",
    },
    marginBottom: "20px",
  },
};

export default settingsStyles;
