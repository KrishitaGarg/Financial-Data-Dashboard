import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Link,
  Stack,
} from "@mui/material";

const CompanyNews = ({ selectedSymbol }) => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const colors = ["#aaa6a6", "#8db0ac"];

  useEffect(() => {
    if (!selectedSymbol) return;

    const fetchNews = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        // Calculate date range
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(toDate.getDate() - 7); // 7 days ago

        const formattedToDate = toDate.toISOString().split("T")[0];
        const formattedFromDate = fromDate.toISOString().split("T")[0];

        const response = await fetch(
          `https://finnhub.io/api/v1/company-news?symbol=${selectedSymbol}&from=${formattedFromDate}&to=${formattedToDate}&token=${process.env.REACT_APP_FINNHUB_API_KEY}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch news data");
        }
        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.error("Error fetching news data:", error);
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [selectedSymbol]);

  return (
    <Box m={5} maxWidth={700} mx="auto">
      {isLoading ? (
        <Box display="flex" flexDirection="column" alignItems="center">
          <CircularProgress />
          <Typography>Loading news...</Typography>
        </Box>
      ) : errorMessage ? (
        <Alert severity="error">{errorMessage}</Alert>
      ) : news.length === 0 ? (
        <Typography>No news available for this company.</Typography>
      ) : (
        <Stack spacing={2}>
          {news.map((article, index) => (
            <Card
              key={article.id}
              sx={{
                backgroundColor: colors[index % colors.length],
                color: "black",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                width: "100%",
                height: "100%",
                margin: "0 auto",
                "&:hover": {
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)",
                  transform: "translateY(-5px)",
                },
              }}
            >
              {article.image && (
                <CardMedia
                  component="img"
                  alt={article.headline}
                  image={article.image}
                  sx={{ height: 200, objectFit: "cover" }}
                />
              )}
              <CardContent
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  <Link href={article.url} target="_blank" rel="noopener">
                    {article.headline}
                  </Link>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(article.datetime * 1000).toLocaleString()} |{" "}
                  {article.source}
                </Typography>
                <Typography variant="body2">{article.summary}</Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default CompanyNews;
