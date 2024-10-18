import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: "#b9e6e3",
          border: "1px solid #ddd",
          borderRadius: "5px",
          padding: "10px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
          color: "black",
        }}
      >
        <Typography variant="subtitle1">{`Time: ${label}`}</Typography>
        <Typography variant="subtitle1">{`Price: $${payload[0].value.toFixed(
          4
        )}`}</Typography>
      </Box>
    );
  }

  return null;
};

const LiveStockTicker = ({ selectedSymbol }) => {
  const [livePrice, setLivePrice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const ws = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    if (!selectedSymbol) return;

    if (ws.current) {
      ws.current.close();
    }

    ws.current = new WebSocket(
      `wss://ws.finnhub.io?token=${process.env.REACT_APP_FINNHUB_API_KEY}`
    );

    ws.current.onopen = () => {
      ws.current.send(
        JSON.stringify({ type: "subscribe", symbol: selectedSymbol })
      );
      setIsLoading(false);
      setErrorMessage(null);
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "trade" && message.data.length > 0) {
        const latestTrade = message.data[0];
        const latestPrice = latestTrade.p;
        setLivePrice(latestPrice);

        const newDataPoint = {
          time: new Date().toLocaleTimeString(),
          price: latestPrice,
        };
        setHistoricalData((prevData) => [...prevData, newDataPoint].slice(-50));
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error: ", error);
      setErrorMessage("Error connecting to the WebSocket. Please try again.");
      setIsLoading(false);
    };

    ws.current.onclose = (event) => {
      if (event.wasClean) {
        console.log(
          `Connection closed cleanly, code=${event.code}, reason=${event.reason}`
        );
      } else {
        setErrorMessage("WebSocket connection closed unexpectedly.");
        console.error("WebSocket connection closed unexpectedly:", event);
      }
      setIsLoading(false);
    };

    return () => {
      if (ws.current) {
        if (ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(
            JSON.stringify({ type: "unsubscribe", symbol: selectedSymbol })
          );
        }
        ws.current.close();
      }
    };
  }, [selectedSymbol]);

  return (
    <Box m={5}>
      {isLoading ? (
        <CircularProgress />
      ) : errorMessage ? (
        <Alert severity="error">{errorMessage}</Alert>
      ) : (
        <>
          <Typography variant="h5" marginBottom={5}>
            Current Price : {livePrice ? `$${livePrice.toFixed(4)}` : "No data"}{" "}
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={historicalData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="black" />
              <XAxis
                dataKey="time"
                label={{ value: "Time", position: "bottom", offset: -7 }}
                tick={{ fill: "black" }}
                stroke="black"
              />
              <YAxis
                domain={[
                  livePrice ? livePrice - 1 : 0,
                  livePrice ? livePrice + 1 : 2,
                ]}
                label={{
                  value: "Price (USD)",
                  angle: -90,
                  position: "insideLeft",
                  offset: -13,
                }}
                tick={{ fill: "black" }}
                stroke="black"
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke={theme.palette.primary.main}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </Box>
  );
};

export default LiveStockTicker;
