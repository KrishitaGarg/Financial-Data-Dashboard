import React, { useEffect, useState, useRef } from "react";
import {
  fetchStockSymbols,
  fetchHistoricalPrices,
  fetchFinancialRatios,
  fetchKPIData,
} from "../services/APIService";
import { Chart, registerables } from "chart.js/auto";
import "chartjs-adapter-date-fns";
import {
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Typography,
  Container,
  Grid,
  CircularProgress,
  TextField,
  Snackbar,
  Alert as MuiAlert,
  IconButton,
  AppBar,
  Toolbar,
  Button,
} from "@mui/material";
import "./styles.css";
import MenuIcon from "../assets/menu.png";

Chart.register(...registerables);

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const toTitleCaseWithSpaces = (str) => {
  return str
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const Dashboard = ({ onLogout }) => {
  const [stockSymbols, setStockSymbols] = useState([]);
  const [filteredStockSymbols, setFilteredStockSymbols] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [historicalPrices, setHistoricalPrices] = useState([]);
  const [FRs, setFRData] = useState([]);
  const [loadingSymbols, setLoadingSymbols] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [chartType, setChartType] = useState("line");
  const [searchTerm, setSearchTerm] = useState("");
  const [kpis, setKpis] = useState({});
  const [selectedDetail, setSelectedDetail] = useState("graph");
  const [timeframe, setTimeframe] = useState("1mo");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadStockSymbols = async () => {
      try {
        setLoadingSymbols(true);
        const symbols = await fetchStockSymbols();
        setStockSymbols(Array.isArray(symbols) ? symbols : []);
        setFilteredStockSymbols(Array.isArray(symbols) ? symbols : []);
      } catch (err) {
        setError("Failed to fetch stock symbols.");
      } finally {
        setLoadingSymbols(false);
      }
    };

    loadStockSymbols();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      if (searchTimeout) clearTimeout(searchTimeout);

      setSearchTimeout(
        setTimeout(() => {
          const filtered = stockSymbols.filter((symbol) =>
            symbol.symbol.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setFilteredStockSymbols(filtered);
        }, 300)
      );
    } else {
      setFilteredStockSymbols(stockSymbols);
    }

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTerm, stockSymbols]);

  useEffect(() => {
    const getFRData = async () => {
      if (selectedSymbol) {
        try {
          const FRData = await fetchFinancialRatios(selectedSymbol);
          setFRData(FRData);
        } catch (error) {
          setError("Error fetching Financial Ratios data. Please try again.");
          setFRData({});
        }
      }
    };

    getFRData();
  }, [selectedSymbol]);

  useEffect(() => {
    const getKPIData = async () => {
      if (selectedSymbol) {
        try {
          const kpiData = await fetchKPIData(selectedSymbol);
          setKpis(kpiData);
        } catch (error) {
          setError("Error fetching KPI data. Please try again.");
          setKpis({});
        }
      }
    };

    getKPIData();
  }, [selectedSymbol]);

  useEffect(() => {
    const getHistoricalPrices = async () => {
      if (selectedSymbol) {
        setLoadingData(true);
        try {
          const prices = await fetchHistoricalPrices(selectedSymbol);
          if (Array.isArray(prices)) {
            setHistoricalPrices(prices);
          } else {
            setError("Invalid historical prices data received.");
            setHistoricalPrices([]);
          }
        } catch (error) {
          console.error(error);
          setError("Error fetching historical prices data. Please try again.");
          setHistoricalPrices([]);
        } finally {
          setLoadingData(false);
        }
      }
    };

    getHistoricalPrices();
  }, [selectedSymbol]);

  const plotChart = (data) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas is null");
      return;
    }

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const labels = data.map((d) => d.date);
    const openingPrices = data.map((d) => d.open);
    const closingPrices = data.map((d) => d.close);

    if (
      labels.length === 0 ||
      openingPrices.length === 0 ||
      closingPrices.length === 0
    ) {
      console.warn("No data to plot");
      return;
    }

    const ctx = canvas.getContext("2d");

    chartInstanceRef.current = new Chart(ctx, {
      type: chartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: `${selectedSymbol} Opening Price`,
            data: openingPrices,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            pointRadius: 3,
            fill: false,
            tension: 0.3,
          },
          {
            label: `${selectedSymbol} Closing Price`,
            data: closingPrices,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            pointRadius: 3,
            fill: false,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                return `${
                  tooltipItem.dataset.label
                }: $${tooltipItem.raw.toFixed(2)} (${tooltipItem.label})`;
              },
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: "Date" },
            type: "time",
            time: {
              unit: "day",
              tooltipFormat: "MMM dd, yyyy",
            },
          },
          y: {
            title: { display: true, text: "Price (USD)" },
            beginAtZero: false,
          },
        },
      },
    });
  };

  useEffect(() => {
    if (historicalPrices.length > 0) {
      console.log("Plotting chart with data:", historicalPrices);
      plotChart(historicalPrices);
    } else if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
  }, [historicalPrices]);

  return (
    <Container sx={{ padding: 0, height: "100vh", width: "100vw" }}>
      {/* Header */}
      <AppBar position="static" sx={{ mb: 2 }}>
        <Toolbar sx={{ justifyContent: "space-between" }} className="navbar">
          <IconButton edge="start" color="inherit" aria-label="menu">
            <img
              src={MenuIcon}
              alt="Menu"
              style={{ width: 28, height: 28, backgroundColor: "none" }}
            />
          </IconButton>
          <Typography variant="h5">Stock Dashboard</Typography>
          <Button color="inherit" onClick={onLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Layout */}
      <Box sx={{ display: "flex", height: "100%" }}>
        {/* Sidebar */}
        <Box sx={{ flex: 1, padding: "20px", borderRight: "1px solid #ccc" }}>
          <TextField
            label="Search Symbol"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
            className="bg-white"
          />

          <FormControl fullWidth margin="normal" className="bg-white">
            <InputLabel>Select Stock Symbol</InputLabel>
            <Select
              value={selectedSymbol}
              onChange={(e) => {
                setSelectedSymbol(e.target.value);
                setSelectedDetail("kpi");
              }}
            >
              {filteredStockSymbols.map((symbol) => (
                <MenuItem key={symbol.symbol} value={symbol.symbol}>
                  {symbol.symbol}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loadingSymbols && <CircularProgress />}
          {loadingData && <CircularProgress />}

          {error && (
            <Typography color="error" variant="h6">
              {error}
            </Typography>
          )}

          <Box mt={4}>
            <Box
              sx={{
                backgroundColor: "#f0f0f0",
                padding: "10px",
                borderRadius: "4px",
                marginTop: "10px",
              }}
            >
              {/* Clickable Sections */}
              <Box>
                <Box
                  sx={{
                    cursor: "pointer",
                    padding: "45px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    marginBottom: "10px",
                    fontSize: "22px",
                    backgroundColor:
                      selectedDetail === "kpi" ? "#e0f7fa" : "#fff",
                    "&:hover": { backgroundColor: "#b2ebf2" },
                  }}
                  onClick={() => setSelectedDetail("kpi")}
                >
                  KPI Data
                </Box>
                <Box
                  sx={{
                    cursor: "pointer",
                    padding: "45px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    marginBottom: "10px",
                    fontSize: "22px",
                    backgroundColor:
                      selectedDetail === "ratios" ? "#e0f7fa" : "#fff",
                    "&:hover": { backgroundColor: "#b2ebf2" },
                  }}
                  onClick={() => setSelectedDetail("ratios")}
                >
                  Financial Ratios
                </Box>
                <Box
                  sx={{
                    cursor: "pointer",
                    padding: "45px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    marginBottom: "10px",
                    fontSize: "22px",
                    backgroundColor:
                      selectedDetail === "graph" ? "#e0f7fa" : "#fff",
                    "&:hover": { backgroundColor: "#b2ebf2" },
                  }}
                  onClick={() => setSelectedDetail("graph")}
                >
                  Graphical Analysis
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Content Area for Historical Prices or Selected Detail */}
        <Box sx={{ flex: 2, padding: "20px", position: "relative" }}>
          {/* Conditional rendering based on selected detail */}
          {selectedDetail === "kpi" && (
            <Box
              mt={2}
              sx={{
                border: "1px solid #ddd",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                padding: "15px",
              }}
            >
              {Object.keys(kpis).length > 0 ? (
                Object.entries(kpis).map(([key, value]) => (
                  <Box
                    key={key}
                    sx={{
                      border: "1px solid #ccc",
                      borderRadius: "10px",
                      padding: "5px",
                      marginBottom: "10px",
                      backgroundColor: "#f9f9f9",
                      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Typography>
                      {toTitleCaseWithSpaces(key)}: {value}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography>No KPI data available.</Typography>
              )}
            </Box>
          )}

          {selectedDetail === "ratios" && (
            <Box
              mt={2}
              sx={{
                border: "1px solid #ddd",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                padding: "15px",
              }}
            >
              {Object.keys(FRs).length > 0 ? (
                Object.entries(FRs).map(([key, value]) => (
                  <Box
                    key={key}
                    sx={{
                      border: "1px solid #ccc",
                      borderRadius: "10px",
                      padding: "5px",
                      marginBottom: "10px",
                      backgroundColor: "#f9f9f9",
                      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Typography>
                      {toTitleCaseWithSpaces(key)}: {value}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography>No Financial Ratio data available.</Typography>
              )}
            </Box>
          )}

            <Box sx={{ flex: 2, padding: "20px", position: "relative" }}>
              {loadingData && (
                <CircularProgress
                  size={50}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              )}
              <canvas
                ref={canvasRef}
                style={{ width: "100%", height: "400px" }}
              />
            </Box>
        </Box>
      </Box>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          Data loaded successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;
