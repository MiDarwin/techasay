const settingsStyles = {
  container: {
    backgroundColor: "#F5F5F5",
    padding: "20px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start", // Simge ve yazıları yukarı hizala
  },
  iconContainer: {
    marginBottom: "20px", // Yazılarla simge arasına boşluk ekle
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: "70px", // Simge boyutunu biraz büyüt
    color: "#A5B68D", // Renk değişikliği
    cursor: "pointer",
  },
  welcomeMessage: {
    fontSize: "1.5rem",
    color: "#A5B68D",
    marginBottom: "10px",
  },
  title: {
    fontSize: "2rem",
    color: "#333",
    marginBottom: "5px",
    textAlign: "center",
  },
  description: {
    fontSize: "1rem",
    color: "#666",
    textAlign: "center",
    marginBottom: "20px",
  },
};

export default settingsStyles;
