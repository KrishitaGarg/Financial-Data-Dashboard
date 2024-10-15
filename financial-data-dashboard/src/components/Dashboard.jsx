import React, { useEffect, useState, useRef } from "react";
import {
  fetchStockSymbols,
  fetchHistoricalPrices,
  fetchFinancialRatios,
} from "../services/APIService";
import { Chart, registerables } from "chart.js/auto";
import 'chartjs-adapter-date-fns';
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
  Button,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";

Chart.register(...registerables);

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Dashboard = () => {
  const [stockSymbols, setStockSymbols] = useState([]);
  const [filteredStockSymbols, setFilteredStockSymbols] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [historicalPrices, setHistoricalPrices] = useState([]);
  const [financialRatios, setFinancialRatios] = useState([]);
  const [yearRange, setYearRange] = useState([2013, 2023]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [chartType, setChartType] = useState("line");
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadStockSymbols = async () => {
      try {
        setLoading(true);
        const symbols = await fetchStockSymbols();
        setStockSymbols(Array.isArray(symbols) ? symbols : []);
        setFilteredStockSymbols(Array.isArray(symbols) ? symbols : []);
      } catch (err) {
        setError("Failed to fetch stock symbols.");
      } finally {
        setLoading(false);
      }
    };


    loadStockSymbols();
  }, []);

  useEffect(() => {
    if (stockSymbols) {
      const filtered = stockSymbols.filter((symbol) =>
        symbol.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStockSymbols(filtered);
    }
  }, [searchTerm, stockSymbols]);

  useEffect(() => {
    const loadData = async () => {
      if (selectedSymbol) {
        setLoading(true);
        setError("");
        try {
          const [prices, ratios] = await Promise.all([
            fetchHistoricalPrices(selectedSymbol),
            fetchFinancialRatios(selectedSymbol),
          ]);
          setHistoricalPrices(prices);
          setFinancialRatios(ratios);
        } catch (err) {
          setError("Failed to fetch data for the selected symbol.");
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [selectedSymbol]);

  useEffect(() => {
    if (historicalPrices && historicalPrices.length > 0) {
      const filtered = historicalPrices.filter((item) => {
        const year = new Date(item.date).getFullYear();
        return year >= yearRange[0] && year <= yearRange[1];
      });
      plotChart(filtered);
    }
  }, [historicalPrices, yearRange]);

  const handleToggleFavorite = (symbol) => {
    setFavorites((prev) => {
      if (prev.includes(symbol)) {
        return prev.filter((fav) => fav !== symbol);
      }
      return [...prev, symbol];
    });
    setOpenSnackbar(true);
  };

  const handleSymbolChange = (event) => {
    setSelectedSymbol(event.target.value);
  };

  const handleRangeChange = (event) => {
    const range = event.target.value.split("-");
    setYearRange([parseInt(range[0]), parseInt(range[1])]);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(historicalPrices, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedSymbol}_data.json`;
    a.click();
  };

  const plotChart = (data) => {

    if (!data || data.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = document.getElementById("myChart").getContext("2d");

    chartInstanceRef.current = new Chart(ctx, {
      type: chartType,
      data: {
        labels: data.map((d) => d.date),
        datasets: [
          {
            label: `${selectedSymbol} Closing Price`,
            data: data.map((d) => d.close),
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor:
              chartType === "bar"
                ? "rgba(75, 192, 192, 0.2)"
                : "rgba(75, 192, 192, 0.2)",
            pointBorderColor: "rgba(75, 192, 192, 1)",
            pointBackgroundColor: "rgba(75, 192, 192, 1)",
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
              unit: "year",
            },
          },
          y: {
            title: { display: true, text: "Closing Price (USD)" },
            beginAtZero: false,
          },
        },
      },
    });
  };

  const handleSymbolSelect = (event) => {
    const symbol = event.target.value;
    setSelectedSymbol(symbol);
  };

  useEffect(() => {
    if (selectedSymbol) {
      const fetchData = async () => {
        try {
          const response = await fetch(`api/endpoint/${selectedSymbol}`);
          const result = await response.json();
          setData(result.data || []);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, [selectedSymbol]);

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          style={{ fontWeight: "700", color: "blue" }}
        >
          Financial Data Dashboard
        </Typography>

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert onClose={() => setOpenSnackbar(false)} severity="success">
            Added to favorites!
          </Alert>
        </Snackbar>

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search Stock Symbol"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="symbol-label" shrink={Boolean(selectedSymbol)}>
                Select Stock Symbol
              </InputLabel>
              <Select
                labelId="symbol-label"
                value={selectedSymbol}
                onChange={handleSymbolChange}
                displayEmpty
              >
                <MenuItem value="">
                  <em>Select a stock symbol</em>
                </MenuItem>
                {filteredStockSymbols.map((symbol) => (
                  <MenuItem key={symbol.symbol} value={symbol.symbol}>
                    {symbol.symbol} - {symbol.name}
                    <Button onClick={() => handleToggleFavorite(symbol.symbol)}>
                      {favorites.includes(symbol.symbol)
                        ? "Unfavorite"
                        : "Favorite"}
                    </Button>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel
                id="year-range-label"
                style={{ fontSize: "20px" }}
                shrink={Boolean(yearRange[0])}
              >
                Select Year Range
              </InputLabel>
              <Select
                labelId="year-range-label"
                value={`${yearRange[0]}-${yearRange[1]}`}
                onChange={handleRangeChange}
              >
                <MenuItem value="2013-2023">2013-2023</MenuItem>
                <MenuItem value="2018-2023">2018-2023</MenuItem>
                <MenuItem value="2020-2023">2020-2023</MenuItem>
                <MenuItem value="2021-2023">2021-2023</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box my={4}>
          <canvas id="myChart" width="400" height="200"></canvas>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={exportData}
          disabled={!selectedSymbol}
        >
          Export Data
        </Button>
      </Box>
    </Container>
  );
};

export default Dashboard;