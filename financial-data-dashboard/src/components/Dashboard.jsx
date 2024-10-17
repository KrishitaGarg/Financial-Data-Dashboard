import React, { useEffect, useState, useRef, useCallback } from "react";
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
  Switch,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
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
  const [selectedDetail, setSelectedDetail] = useState("kpi");
  const [timeframe, setTimeframe] = useState("1mo");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const canvasRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleThemeToggle = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const lightTheme = createTheme({
    palette: {
      mode: "light",
      background: {
        default: "#f0f0f0",
      },
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      background: {
        default: "#303030",
      },
    },
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

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
        try {
          const prices = await fetchHistoricalPrices(selectedSymbol);
          setHistoricalPrices(prices);
          console.log(prices);
        } catch (error) {
          console.error("Error fetching historical prices:", error);
          setError("Error fetching historical prices data. Please try again.");
          setHistoricalPrices([]);
        }
      }
    };

    getHistoricalPrices();
  }, [selectedSymbol]);

  const plotChart = useCallback(
    (data) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Canvas element is not yet rendered.");
        return;
      }

      // Destroy old chart instance if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = canvas.getContext("2d");

      const labels = data.map((d) => d.date);
      const openingPrices = data.map((d) => d.open);
      const closingPrices = data.map((d) => d.close);

      if (!labels.length || !openingPrices.length || !closingPrices.length) {
        console.warn("No valid data to plot");
        return;
      }

      chartInstanceRef.current = new Chart(ctx, {
        type: chartType,
        data: {
          labels,
          datasets: [
            {
              label: `${selectedSymbol} Opening Price`,
              data: openingPrices,
              borderColor: isDarkMode
                ? "rgba(75, 192, 192, 0.8)"
                : "rgba(75, 192, 192, 1)",
              backgroundColor: isDarkMode
                ? "rgba(75, 192, 192, 0.1)"
                : "rgba(75, 192, 192, 0.2)",
              pointRadius: 3,
              fill: false,
              tension: 0.3,
              color: isDarkMode ? "#f5f5f5" : "#000",
            },
            {
              label: `${selectedSymbol} Closing Price`,
              data: closingPrices,
              borderColor: isDarkMode
                ? "rgba(255, 99, 132, 0.8)"
                : "rgba(255, 99, 132, 1)",
              backgroundColor: isDarkMode
                ? "rgba(255, 99, 132, 0.1)"
                : "rgba(255, 99, 132, 0.2)",
              pointRadius: 3,
              fill: false,
              tension: 0.3,
              color: isDarkMode ? "#f5f5f5" : "#000",
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
              ticks: {
                color: isDarkMode ? "#f5f5f5" : "#000",
              },
              grid: {
                color: isDarkMode ? "#757575" : "#ddd",
              },
            },
            y: {
              title: { display: true, text: "Price (USD)" },
              beginAtZero: false,
              ticks: {
                color: isDarkMode ? "#f5f5f5" : "#000",
              },
              grid: {
                color: isDarkMode ? "#757575" : "#ddd",
              },
            },
          },
        },
      });
    },
    [selectedSymbol, chartType]
  );

  useEffect(() => {
    if (selectedDetail === "graph" && historicalPrices.length > 0) {
      console.log("Plotting chart with data:", historicalPrices);
      plotChart(historicalPrices);
    }
  }, [selectedDetail, historicalPrices, plotChart]);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <Container
        className={isDarkMode ? "dark-mode" : "light-mode"}
        sx={{ padding: 0, height: "100vh", width: "100vw" }}
      >
        {/* Header */}
        <AppBar position="static" sx={{ mb: 2 }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <IconButton edge="start" color="inherit" aria-label="menu">
              <img
                src={MenuIcon}
                alt="Menu"
                style={{ width: 28, height: 28, backgroundColor: "none" }}
              />
            </IconButton>
            <Typography variant="h5">Stock Dashboard</Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="body1" sx={{}}>
                {isDarkMode ? "🌛" : "🌞"}
              </Typography>
              <Switch checked={isDarkMode} onChange={handleThemeToggle} />
              <Button color="inherit" onClick={onLogout}>
                Logout
              </Button>
            </Box>
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
              slotProps={{
                input: {
                  style: {
                    backgroundColor: isDarkMode ? "#424242" : "#fff",
                    color: isDarkMode ? "#fff" : "#000",
                  },
                },
                inputLabel: {
                  style: {
                    color: isDarkMode ? "#fff" : "#000",
                  },
                },
              }}
              sx={{
                backgroundColor: isDarkMode ? "#424242" : "#fff",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#ccc",
                  },
                  "&:hover fieldset": {
                    borderColor: "#aaa",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#888",
                  },
                },
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel
                sx={{
                  color: isDarkMode ? "#fff" : "#000",
                }}
              >
                Select Stock Symbol
              </InputLabel>
              <Select
                value={selectedSymbol}
                onChange={(e) => {
                  setSelectedSymbol(e.target.value);
                  setSelectedDetail("kpi");
                }}
                variant="outlined"
                sx={{
                  backgroundColor: isDarkMode ? "#424242" : "#fff",
                  color: isDarkMode ? "#fff" : "#000",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ccc",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#aaa",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#888",
                  },
                  "& .MuiSelect-icon": {
                    color: isDarkMode ? "#fff" : "#000",
                  },
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

            {/* Sidebar options */}
            <Box mt={4}>
              <Box
                sx={{
                  backgroundColor: isDarkMode ? "#424242" : "#f0f0f0",
                  padding: "10px",
                  borderRadius: "4px",
                  marginTop: "10px",
                }}
              >
                {/* Sidebar Sections */}
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
                        selectedDetail === "kpi"
                          ? isDarkMode
                            ? "#78909C"
                            : "#e0f7fa"
                          : isDarkMode
                          ? "#424242"
                          : "#fff",
                      "&:hover": {
                        backgroundColor: isDarkMode ? "#616161" : "#b2ebf2",
                      },
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
                        selectedDetail === "ratios"
                          ? isDarkMode
                            ? "#78909C"
                            : "#e0f7fa"
                          : isDarkMode
                          ? "#424242"
                          : "#fff",
                      "&:hover": {
                        backgroundColor: isDarkMode ? "#616161" : "#b2ebf2",
                      },
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
                        selectedDetail === "graph"
                          ? isDarkMode
                            ? "#78909C"
                            : "#e0f7fa"
                          : isDarkMode
                          ? "#424242"
                          : "#fff",
                      "&:hover": {
                        backgroundColor: isDarkMode ? "#616161" : "#b2ebf2",
                      },
                    }}
                    onClick={() => setSelectedDetail("graph")}
                  >
                    Graphical Analysis
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Content Area */}
          <Box sx={{ flex: 2, padding: "20px", position: "relative" }}>
            {/* Conditional rendering based on selected detail */}
            {selectedDetail === "kpi" && (
              <Box
                mt={2}
                sx={{
                  border: "1px solid #ddd",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                  padding: "15px",
                  backgroundColor: isDarkMode ? "#424242" : "#fff",
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
                        backgroundColor: isDarkMode ? "#616161" : "#e0f7fa",
                        "&:hover": {
                          backgroundColor: isDarkMode ? "#424242" : "#b2ebf2",
                        },
                      }}
                    >
                      <Typography variant="h6">
                        {toTitleCaseWithSpaces(key)}: {value}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography>Fetching KPI data...</Typography>
                )}
              </Box>
            )}
            {/* Graph Content */}
            <Box
              mt={2}
              sx={{
                border: "1px solid #ddd",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                padding: "15px",
                backgroundColor: isDarkMode ? "#424242" : "#fff",
                position: "relative",
              }}
            >
              {selectedDetail === "graph" && (
                <Box>
                  <canvas
                    ref={canvasRef}
                    style={{ width: "100%", height: "400px" }}
                  />
                </Box>
              )}
            </Box>
            {/* Financial Ratios Content */}
            {selectedDetail === "ratios" && (
              <Box
                mt={2}
                sx={{
                  border: "1px solid #ddd",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                  padding: "15px",
                  backgroundColor: isDarkMode ? "#424242" : "#fff",
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
                        backgroundColor: isDarkMode ? "#616161" : "#e0f7fa",
                        "&:hover": {
                          backgroundColor: isDarkMode ? "#424242" : "#b2ebf2",
                        },
                      }}
                    >
                      <Typography variant="h6">
                        {toTitleCaseWithSpaces(key)}: {value}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography>Fetching Financial ratios data...</Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Dashboard;
