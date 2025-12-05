import React, { useRef, useMemo, useCallback } from "react";
import useSWR from "swr";
import supabase from "../../../supabase/supabaseClient";

const CACHE_DURATION = 2 * 60 * 60 * 1000; // 7 hours
const CACHE_VERSION = "1.0.1";

// Fetcher function with localStorage caching
const fetcher = async () => {
  const cachedVersion = localStorage.getItem("madhur_day_version");
  const cachedData = localStorage.getItem("madhur_day_data");
  const cachedTimestamp = localStorage.getItem("madhur_day_timestamp");
  const now = Date.now();

  if (
    cachedData &&
    cachedTimestamp &&
    cachedVersion === CACHE_VERSION &&
    now - parseInt(cachedTimestamp, 10) < CACHE_DURATION
  ) {
    return JSON.parse(cachedData);
  }

  const { data, error } = await supabase
    .from("madhur_day")
    .select("*")
    .order("id", { ascending: false })
    .limit(1500);

  if (error) throw error;

  const processed = data.reverse().map(({ id, ...rest }) => rest);
  localStorage.setItem("madhur_day_data", JSON.stringify(processed));
  localStorage.setItem("madhur_day_timestamp", now.toString());
  localStorage.setItem("madhur_day_version", CACHE_VERSION);

  return processed;
};

const MadhurDayChart = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const bottomRef = useRef(null);
  const topRef = useRef(null);

  // Use SWR with a 7-hour refresh interval
  const { data, error, isLoading, mutate } = useSWR(
    "madhur_day_data",
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: CACHE_DURATION, // Auto-refresh every 7 hours
      dedupingInterval: 2 * 60 * 60 * 1000,
    }
  );

  // Memoize red middle numbers for O(1) lookup
  const redMiddleNumbers = useMemo(
    () => [
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
    ],
    []
  );
  const redNumbersSet = useMemo(
    () => new Set(redMiddleNumbers),
    [redMiddleNumbers]
  );

  // Calculation functions
  const calculateDifference = useCallback((middleValue) => {
    if (middleValue === "**") return "*";
    const numValue = parseInt(middleValue, 10) || 0;
    if (numValue < 10) return numValue;
    const firstDigit = Math.floor(numValue / 10);
    const secondDigit = numValue % 10;
    return Math.abs(firstDigit - secondDigit);
  }, []);

  const calculateTotal = useCallback((middleValue) => {
    if (middleValue === "**") return "*";
    const numValue = parseInt(middleValue, 10) || 0;
    if (numValue < 10) return numValue;
    const firstDigit = Math.floor(numValue / 10);
    const secondDigit = numValue % 10;
    return (firstDigit + secondDigit) % 10;
  }, []);

  // Process a single data item with all calculations
  const processDataItem = useCallback(
    (item) => {
      const processedItem = { ...item };
      days.forEach((day) => {
        const dayValue = item[day];
        if (dayValue) {
          processedItem[`${day}_difference`] = calculateDifference(dayValue);
          processedItem[`${day}_total`] = calculateTotal(dayValue);
        }
      });
      return processedItem;
    },
    [days, calculateDifference, calculateTotal]
  );

  // Process all data once fetched
  const processedData = useMemo(() => {
    return data ? data.map(processDataItem) : [];
  }, [data, processDataItem]);

  // Helper functions
  const formatMiddleValue = useCallback((value, isMiddleValue = true) => {
    const strVal = String(value);
    return isMiddleValue && strVal.length === 1 ? `0${strVal}` : strVal;
  }, []);

  const renderVertical = useCallback((value) => {
    const strVal = String(value);
    return strVal.split("").map((digit, idx) => <div key={idx}>{digit}</div>);
  }, []);

  const splitDateRange = useCallback((dateRange) => {
    if (!dateRange) return { startDate: "", toText: "", endDate: "" };
    const parts = dateRange.split(" to ");
    if (parts.length === 2) {
      return { startDate: parts[0], toText: "to", endDate: parts[1] };
    }
    return { startDate: dateRange, toText: "", endDate: "" };
  }, []);

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
    mutate();
  }, [mutate]);

  // Optimized table row component
  const TableRow = useCallback(
    ({ item, index }) => {
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
          {days.map((day, dayIndex) => {
            const dayValue = item[day] || "";
            const opValue = item[`${day}_OP`] || "";
            const cpValue = item[`${day}_CP`] || "";
            const differenceValue = item[`${day}_difference`];
            const totalValue = item[`${day}_total`];
            const formattedMiddleValue = formatMiddleValue(dayValue, true);
            const isRedNumber = redNumbersSet.has(formattedMiddleValue);
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
    [days, formatMiddleValue, renderVertical, splitDateRange, redNumbersSet]
  );

  if (isLoading && (!data || data.length === 0)) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="w-full p-4 border-b border-gray-300 bg-yellow-300 text-center">
          <h2 className="text-center text-xl font-bold">
            MADHUR DAY PANEL CHART
          </h2>
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

  if (error && (!data || data.length === 0)) {
    return (
      <div className="w-full max-w-md mx-auto bg-red-100 p-4 rounded border border-red-300">
        <div className="text-red-700 text-center">
          <h2 className="text-xl font-bold mb-2">Error Loading Chart</h2>
          <p>{error.message || "Failed to load data. Please try again."}</p>
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
      {/* Top section with header and navigation buttons */}
      <div
        ref={topRef}
        className="w-full p-4 border-b border-gray-300 bg-yellow-300 text-center top-0 z-10"
      >
        <h2 className="text-center text-xl font-bold">
          MADHUR DAY PANEL CHART
        </h2>
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
        <div className="text-xs mt-1">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Table section */}
      <div className="w-full border-2 border-pink-500 shadow-md p-2 overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200 shadow-md">
          <thead className="bg-[#ad4b7e] text-white top-0">
            <tr>
              <th className="border border-gray-200 p-1 text-sm">Date</th>
              {days.map((day) => (
                <th key={day} className="border border-gray-200 p-1 text-sm">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedData.map((item, index) => (
              <TableRow key={index} item={item} index={index} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom navigation buttons */}
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
        <h2 className="text-center text-xl font-bold">
          MADHUR DAY PANEL CHART
        </h2>
        <h3 className="text-center text-lg font-semibold">
          MADHUR DAY PANEL RESULT CHART RECORDS
        </h3>
      </div>
    </div>
  );
};

export default React.memo(MadhurDayChart);
