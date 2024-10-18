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
import LiveStockTicker from "./LiveStockTicker";

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

      setLoadingData(true);

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = canvas.getContext("2d");

      const labels = data.map((d) => d.date);
      const openingPrices = data.map((d) => d.open);
      const closingPrices = data.map((d) => d.close);

      if (!labels.length || !openingPrices.length || !closingPrices.length) {
        console.warn("No valid data to plot");
        setLoadingData(false);
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
              color: isDarkMode ? "#fff" : "#000",
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
              color: isDarkMode ? "#fff" : "#000",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: (tooltipItem) => {
                  return `${
                    tooltipItem.dataset.label
                  }: $${tooltipItem.raw.toFixed(2)} (${tooltipItem.label})`;
                },
              },
              titleColor: isDarkMode ? "#fff" : "#000",
              bodyColor: isDarkMode ? "#fff" : "#000",
              footerColor: isDarkMode ? "#fff" : "#000",
              backgroundColor: isDarkMode
                ? "rgba(0, 0, 0, 0.8)"
                : "rgba(255, 255, 255, 0.9)",
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Date",
                color: isDarkMode ? "#fff" : "#000",
              },
              type: "time",
              time: {
                unit: "day",
                tooltipFormat: "MMM dd, yyyy",
                displayFormats: {
                  day: "MMM dd, yyyy",
                },
              },
              ticks: {
                color: isDarkMode ? "#fff" : "#000",
              },
              grid: {
                color: isDarkMode ? "white" : "black",
              },
            },
            y: {
              title: {
                display: true,
                text: "Price (USD)",
                color: isDarkMode ? "#fff" : "#000",
              },
              beginAtZero: false,
              ticks: {
                color: isDarkMode ? "#fff" : "#000",
              },
              grid: {
                color: isDarkMode ? "white" : "black",
              },
            },
          },
        },
      });
      setLoadingData(false);
    },
    [selectedSymbol, chartType, isDarkMode]
  );

  useEffect(() => {
    if (historicalPrices.length > 0) {
      console.log("Plotting chart with data:", historicalPrices);
      plotChart(historicalPrices);
    }
  }, [historicalPrices, plotChart]);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <Container
        className={isDarkMode ? "dark-mode" : "light-mode"}
        sx={{ padding: 0, height: "100vh", width: "100vw" }}
      >
        {/* Header */}
        <AppBar
          position="static"
          sx={{
            mb: 2,
            backgroundColor: isDarkMode ? "#1a1a1a" : "#1976d2",
            boxShadow: "0 3px 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between", padding: "0 20px" }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: "#fff", letterSpacing: "1px" }}
            >
              Stock Dashboard
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography
                variant="body1"
                sx={{ marginRight: "10px", color: "#fff" }}
              >
                {isDarkMode ? "🌛" : "🌞"}
              </Typography>
              <Switch checked={isDarkMode} onChange={handleThemeToggle} />
              <Button
                color="inherit"
                onClick={onLogout}
                sx={{
                  backgroundColor: isDarkMode ? "#333" : "#fff",
                  color: isDarkMode ? "#fff" : "#1976d2",
                  borderRadius: "8px",
                  padding: "5px 15px",
                  marginLeft: "20px",
                  textTransform: "capitalize",
                }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Search and Select Options */}
        <Box
          sx={{
            display: "flex",
            padding: "20px 20px 0 20px",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <TextField
            label="Search Symbol"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            fullWidth
            sx={{
              flex: 1,
              backgroundColor: isDarkMode ? "#333" : "#fff",
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
              borderRadius: "10px",
            }}
          />
          <FormControl fullWidth sx={{ flex: 1 }}>
            <InputLabel sx={{ color: isDarkMode ? "#fff" : "#000" }}>
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
                backgroundColor: isDarkMode ? "#333" : "#fff",
                color: isDarkMode ? "#fff" : "#000",
                borderRadius: "10px",
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
              <MenuItem value="" disabled>
                Select a stock symbol
              </MenuItem>
              {filteredStockSymbols.length > 0 ? (
                filteredStockSymbols.map((symbol) => (
                  <MenuItem key={symbol.symbol} value={symbol.symbol}>
                    {symbol.symbol}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No symbols found</MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>

        {/* Main Layout for Data Boxes */}
        <Box
          sx={{
            padding: "20px",
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "1fr",
              lg: "repeat(2, 1fr)",
            },
            gap: "20px",
            alignItems: "stretch",
          }}
        >
          {/* KPI Data Box */}
          <Box
            sx={{
              border: "1px solid #ddd",
              padding: "20px",
              backgroundColor: isDarkMode ? "#625166" : "#ffebcc",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              borderRadius: "15px",
              maxHeight: "550px",
              overflowY: "auto",
              transition: "box-shadow 0.3s ease, transform 0.3s ease",
              "&:hover": {
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)",
                transform: "scale(1.02)",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                marginBottom: "10px",
                color: isDarkMode ? "#fff" : "#333",
              }}
            >
              KPI Data
            </Typography>
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
                  <Typography
                    key={key}
                    sx={{ color: isDarkMode ? "white" : "#333" }}
                  >
                    {toTitleCaseWithSpaces(key)}: {value}
                  </Typography>
                </Box>
              ))
            ) : (
              <CircularProgress color="inherit" />
            )}
          </Box>

          {/* Graphical Analysis Data Box */}
          <Box
            sx={{
              border: "1px solid #ddd",
              padding: "20px",
              backgroundColor: isDarkMode ? "#444238" : "#ccffcc",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              borderRadius: "15px",
              height: "auto",
              maxHeight: "550px",
              transition: "box-shadow 0.3s ease, transform 0.3s ease",
              "&:hover": {
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)",
                transform: "scale(1.02)",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                margin: "0 auto",
                fontWeight: "bold",
                color: isDarkMode ? "#fff" : "#333",
              }}
            >
              Graphical Analysis
            </Typography>
            {loadingData ? (
              <CircularProgress />
            ) : (
              <canvas
                ref={canvasRef}
                style={{ borderRadius: "10px" }}
              />
            )}
          </Box>

          {/* Financial Ratios Data Box */}
          <Box
            sx={{
              border: "1px solid #ddd",
              padding: "20px",
              backgroundColor: isDarkMode ? "#516e5e" : "#e0ccff",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              borderRadius: "15px",
              maxHeight: "550px",
              overflowY: "auto",
              transition: "box-shadow 0.3s ease, transform 0.3s ease",
              "&:hover": {
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)",
                transform: "scale(1.02)",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                marginBottom: "10px",
                color: isDarkMode ? "#fff" : "#333",
              }}
            >
              Financial Ratios
            </Typography>
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
                  <Typography
                    key={key}
                    sx={{ color: isDarkMode ? "white" : "#333" }}
                  >
                    {toTitleCaseWithSpaces(key)}: {value}
                  </Typography>
                </Box>
              ))
            ) : (
              <CircularProgress color="inherit" />
            )}
          </Box>

          {/* Live Stock Data Box */}
          <Box
            sx={{
              border: "1px solid #ddd",
              paddingTop: "20px",
              backgroundColor: isDarkMode ? "#b59898" : "#aad0f2",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              borderRadius: "15px",
              height: "auto",
              maxHeight: "550px",
              transition: "box-shadow 0.3s ease, transform 0.3s ease",
              "&:hover": {
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)",
                transform: "scale(1.02)",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: isDarkMode ? "#fff" : "#333" }}
            >
              Live Stock Data
            </Typography>
            <LiveStockTicker
              selectedSymbol={selectedSymbol}
              theme={isDarkMode ? darkTheme : lightTheme}
            />
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Dashboard;
