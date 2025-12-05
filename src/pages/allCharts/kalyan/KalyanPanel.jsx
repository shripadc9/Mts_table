import React, { useCallback, useMemo, useRef } from "react";
import useSWR from "swr";
import supabase from "../../../supabase/supabaseClient";

// Constants moved outside component to prevent recreation
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 7 hours in milliseconds
const CACHE_VERSION = "1.0.1";
const RED_MIDDLE_NUMBERS = [
  "00",
  "05",
  "50",
  "55",
  "16",
  "11",
  "61",
  "66",
  "22",
  "27",
  "72",
  "77",
  "33",
  "38",
  "83",
  "88",
  "44",
  "49",
  "94",
  "99",
];
const RED_NUMBERS_SET = new Set(RED_MIDDLE_NUMBERS);

// Helper functions moved outside component
const calculateTotal = (middleValue) => {
  if (middleValue === "**") return "*";

  const numValue = parseInt(middleValue || "0", 10);
  if (numValue < 10) return numValue;

  const firstDigit = Math.floor(numValue / 10);
  const secondDigit = numValue % 10;
  return (firstDigit + secondDigit) % 10;
};

const calculateDifference = (middleValue) => {
  if (middleValue === "**") return "*";

  const numValue = parseInt(middleValue || "0", 10);
  if (numValue < 10) return numValue;

  const firstDigit = Math.floor(numValue / 10);
  const secondDigit = numValue % 10;

  const digitDifference =
    firstDigit > secondDigit
      ? Math.abs(firstDigit - (secondDigit + 10))
      : Math.abs(firstDigit - secondDigit);

  return digitDifference % 10;
};

const formatMiddleValue = (value, isMiddleValue = true) => {
  return isMiddleValue && value && value.length === 1 ? `0${value}` : value;
};

const splitDateRange = (dateRange) => {
  if (!dateRange) return { startDate: "", toText: "", endDate: "" };

  const parts = dateRange.split(" to ");
  if (parts.length === 2) {
    return { startDate: parts[0], toText: "to", endDate: parts[1] };
  }
  return { startDate: dateRange, toText: "", endDate: "" };
};

// SWR fetcher function
const fetcher = async () => {
  // Check cache first
  const cachedVersion = localStorage.getItem("kalyan_panel_version");
  const cachedData = localStorage.getItem("kalyan_panel_data");
  const cachedTimestamp = localStorage.getItem("kalyan_panel_timestamp");
  const now = Date.now();

  // If valid cache exists, use it
  if (
    cachedData &&
    cachedTimestamp &&
    cachedVersion === CACHE_VERSION &&
    now - parseInt(cachedTimestamp) < CACHE_DURATION
  ) {
    return JSON.parse(cachedData);
  }

  // Otherwise fetch from API
  const { data: tableData, error } = await supabase
    .from("kalyan_panel")
    .select("*")
    .order("id", { ascending: false })
    .limit(1500);

  if (error) throw error;

  const reversedData = tableData.reverse();
  const cleanedData = reversedData.map(({ ID, ...rest }) => rest);

  // Cache the results
  localStorage.setItem("kalyan_panel_data", JSON.stringify(cleanedData));
  localStorage.setItem("kalyan_panel_timestamp", now.toString());
  localStorage.setItem("kalyan_panel_version", CACHE_VERSION);

  return cleanedData;
};

// Process a single data item - memoized at component level
const processDataItem = (item) => {
  const result = { ...item };

  // Pre-calculate values for each day
  DAYS.forEach((day) => {
    const dayValue = item[day] || "";

    if (dayValue) {
      result[`${day}_difference`] = calculateDifference(dayValue);
      result[`${day}_total`] = calculateTotal(dayValue);
    }
  });

  return result;
};

// Memoized TableRow component
const TableRow = React.memo(
  ({ item }) => {
    const { startDate, toText, endDate } = splitDateRange(
      item["Week Date Range"]
    );

    return (
      <tr>
        <td className="border border-gray-200 p-1 text-sm">
          <div className="flex flex-col items-center">
            <div className="font-bold text-black text-xs">{startDate}</div>
            {toText && (
              <div className="font-bold text-black text-xs">{toText}</div>
            )}
            {endDate && (
              <div className="font-bold text-black text-xs">{endDate}</div>
            )}
          </div>
        </td>
        {DAYS.map((day, dayIndex) => {
          const dayValue = item[day] || "";
          const opValue = item[`${day}_OP`] || "";
          const cpValue = item[`${day}_CP`] || "";
          const differenceValue = item[`${day}_difference`];
          const totalValue = item[`${day}_total`];
          const formattedMiddleValue = formatMiddleValue(dayValue, true);
          const isRedNumber = RED_NUMBERS_SET.has(formattedMiddleValue);

          return (
            <td
              key={dayIndex}
              className="border border-gray-200 p-1 text-sm text-black"
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-center font-semibold">
                  {opValue ? renderVertical(opValue) : <div>&nbsp;</div>}
                </div>
                <div className="flex flex-col items-center">
                  {dayValue ? (
                    <>
                      <div className="text-black text-xs">
                        {differenceValue !== undefined ? (
                          formatMiddleValue(differenceValue.toString(), false)
                        ) : (
                          <div>&nbsp;</div>
                        )}
                      </div>
                      <div
                        className={`text-black font-bold text-xl ${
                          isRedNumber ? "text-red-600" : ""
                        }`}
                      >
                        {formattedMiddleValue}
                      </div>
                      <div className="text-black text-xs">
                        {totalValue !== undefined ? (
                          formatMiddleValue(totalValue.toString(), false)
                        ) : (
                          <div>&nbsp;</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>&nbsp;</div>
                      <div>&nbsp;</div>
                      <div>&nbsp;</div>
                    </>
                  )}
                </div>
                <div className="flex flex-col items-center font-semibold">
                  {cpValue ? renderVertical(cpValue) : <div>&nbsp;</div>}
                </div>
              </div>
            </td>
          );
        })}
      </tr>
    );
  },
  // Optimized comparison: use shallow equality as processed data is memoized
  (prevProps, nextProps) => prevProps.item === nextProps.item
);

// Function to render vertical text
const renderVertical = (value) => {
  return value.split("").map((digit, idx) => <div key={idx}>{digit}</div>);
};

const KalyanChart = () => {
  const bottomRef = useRef(null);
  const topRef = useRef(null);

  // Use SWR for data fetching with auto-revalidation
  const { data, error, isLoading, mutate } = useSWR(
    "kalyan-panel-data",
    fetcher,
    {
      refreshInterval: CACHE_DURATION, // Now auto-refreshes every 7 hours
      revalidateOnFocus: true, // Refresh when user focuses on page
      dedupingInterval: 2 * 60 * 60 * 1000, // Prevent multiple requests in quick succession
      focusThrottleInterval: 60000, // Limit focus revalidations
      errorRetryCount: 3, // Retry 3 times on error
      loadingTimeout: 5000, // Show loading state after 5s
    }
  );

  // Process all data items with memoization
  const processedData = useMemo(() => {
    if (!data) return [];
    return data.map(processDataItem);
  }, [data]);

  // Last fetched timestamp
  const lastFetched = useMemo(() => {
    const timestamp = localStorage.getItem("kalyan_panel_timestamp");
    return timestamp ? parseInt(timestamp) : 0;
  }, [data]); // Recalculate when data changes

  // Navigation functions
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const goHome = useCallback(() => {
    window.location.href = "/";
  }, []);

  const handleRefresh = useCallback(() => {
    mutate(); // Trigger SWR revalidation
  }, [mutate]);

  // Loading skeleton
  if (isLoading && (!data || data.length === 0)) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="w-full p-4 border-b border-gray-300 bg-yellow-300 text-center">
          <h2 className="text-center text-xl font-bold">KALYAN PANEL CHART</h2>
          <div className="text-sm mt-1">Loading latest data...</div>
        </div>
        <div className="w-full border-2 border-pink-500 shadow-md p-2 overflow-x-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 w-full mb-2 rounded"></div>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-gray-200 w-full mb-2 rounded"
              ></div>
            ))}
          </div>
        </div>
        <div className="text-center mt-4">
          <div className="text-lg font-medium">
            <div className="inline-block h-4 w-4 mr-2 rounded-full border-2 border-pink-600 border-t-transparent animate-spin"></div>
            Loading chart data...
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && (!data || data.length === 0)) {
    return (
      <div className="w-full max-w-md mx-auto bg-red-100 p-4 rounded border border-red-300">
        <div className="text-red-700 text-center">
          <h2 className="text-xl font-bold mb-2">Error Loading Chart</h2>
          <p>{error.message || "Failed to load data"}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Top section with header and buttons */}
      <div
        ref={topRef}
        className="w-full p-4 border-b border-gray-300 bg-yellow-300 text-center top-0 z-10"
      >
        <h2 className="text-center text-xl font-bold">KALYAN PANEL CHART</h2>
        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={scrollToBottom}
            className="bg-pink-600 text-white py-2 px-4 rounded hover:bg-pink-700"
          >
            Go to Bottom
          </button>
          <button
            onClick={goHome}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Home
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 relative"
          >
            {isLoading ? (
              <>
                <span className="opacity-0">Refresh</span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                </span>
              </>
            ) : (
              "Refresh"
            )}
          </button>
        </div>
      </div>

      {/* Table section - Only render if we have data */}
      {processedData.length > 0 && (
        <div className="w-full border-2 border-pink-500 shadow-md p-2 overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200 shadow-md">
            <thead className="bg-[#ad4b7e] text-white top-0">
              <tr>
                <th className="border border-gray-200 p-1 text-sm">Date</th>
                {DAYS.map((day) => (
                  <th key={day} className="border border-gray-200 p-1 text-sm">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedData.map((item, index) => (
                <TableRow key={index} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bottom section with buttons */}
      <div className="text-center mt-4 flex justify-center gap-4">
        <button
          onClick={scrollToTop}
          className="bg-pink-600 text-white py-2 px-6 rounded hover:bg-pink-700"
        >
          Go to Top
        </button>
        <button
          onClick={goHome}
          className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700"
        >
          Home
        </button>
      </div>

      <div ref={bottomRef} className="w-full p-4 border-t border-gray-200 mt-4">
        <h2 className="text-center text-xl font-bold">KALYAN PANEL CHART</h2>
        <h3 className="text-center text-lg font-semibold">
          KALYAN PANEL RESULT CHART RECORDS
        </h3>
      </div>
    </div>
  );
};

export default React.memo(KalyanChart);
