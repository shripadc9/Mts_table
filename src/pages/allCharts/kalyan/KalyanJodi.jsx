import React, { useEffect, useState, useRef, useCallback } from "react";
import supabase from "../../../supabase/supabaseClient";

const CACHE_DURATION = 2 * 60 * 60 * 1000; // 7 hours in milliseconds
const CACHE_VERSION = "1.0.1";

const KalyanChart = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [data, setData] = useState([]);
  const [diffTotals, setDiffTotals] = useState({ differences: {}, totals: {} });
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const topRef = useRef(null);

  // Define middle numbers that should be in red
  const redMiddleNumbers = [
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

  // Merged function to calculate differences and totals in one loop
  const calculateDiffAndTotals = useCallback(
    (parsedData) => {
      const differences = {};
      const totals = {};
      parsedData.forEach((item, index) => {
        const diffByWeek = {};
        const totalByWeek = {};
        days.forEach((day) => {
          let middleValue = item[day];
          if (!middleValue || middleValue.trim() === "") {
            diffByWeek[day] = "";
            totalByWeek[day] = "";
          } else if (middleValue === "**") {
            diffByWeek[day] = "**";
            totalByWeek[day] = "**";
          } else {
            const numValue = parseInt(middleValue, 10);
            if (numValue < 10) {
              diffByWeek[day] = numValue;
              totalByWeek[day] = numValue;
            } else {
              const firstDigit = Math.floor(numValue / 10);
              const secondDigit = numValue % 10;
              // Calculate difference
              const digitDifference =
                firstDigit > secondDigit
                  ? Math.abs(firstDigit - (secondDigit + 10))
                  : Math.abs(firstDigit - secondDigit);
              diffByWeek[day] = digitDifference % 10;
              // Calculate total
              const sum = firstDigit + secondDigit;
              totalByWeek[day] = sum % 10;
            }
          }
        });
        differences[index] = diffByWeek;
        totals[index] = totalByWeek;
      });
      setDiffTotals({ differences, totals });
    },
    [days]
  );

  // Format middle value to add a leading zero if needed
  const formatMiddleValue = (value) => {
    return value && value.length === 1 ? `0${value}` : value;
  };

  const splitDateRange = (dateRange) => {
    if (!dateRange) return { startDate: "", toText: "", endDate: "" };
    const parts = dateRange.split(" to ");
    if (parts.length === 2) {
      return { startDate: parts[0], toText: "to", endDate: parts[1] };
    }
    return { startDate: dateRange, toText: "", endDate: "" };
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Check localStorage for cached data
      const cachedVersion = localStorage.getItem("kalyan_chart_version");
      const cachedData = localStorage.getItem("kalyan_chart_data");
      const cachedTimestamp = localStorage.getItem("kalyan_chart_timestamp");
      const now = Date.now();

      if (
        cachedData &&
        cachedTimestamp &&
        cachedVersion === CACHE_VERSION &&
        now - parseInt(cachedTimestamp, 10) < CACHE_DURATION
      ) {
        const parsedData = JSON.parse(cachedData);
        setData(parsedData);
        calculateDiffAndTotals(parsedData);
        setLoading(false);
        return;
      }

      // Fetch from Supabase if no valid cache
      const { data: tableData, error } = await supabase
        .from("kalyan_panel")
        .select("*")
        .order("id", { ascending: false })
        .limit(1500);

      if (error) {
        console.error("Error fetching data:", error);
        return;
      }

      if (tableData && tableData.length > 0) {
        const reversedData = tableData.reverse();
        // Remove ID field from each record
        const processedData = reversedData.map(({ ID, ...rest }) => rest);
        setData(processedData);
        calculateDiffAndTotals(processedData);
        // Cache the results in localStorage
        localStorage.setItem(
          "kalyan_chart_data",
          JSON.stringify(processedData)
        );
        localStorage.setItem("kalyan_chart_timestamp", now.toString());
        localStorage.setItem("kalyan_chart_version", CACHE_VERSION);
      }
    } catch (err) {
      console.error("Error in data fetching:", err);
    } finally {
      setLoading(false);
    }
  }, [calculateDiffAndTotals]);

  // Fetch data on mount and set up auto-refresh every 7 hours
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, CACHE_DURATION);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-xl font-bold">
          The chart is loading. Please wait a moment...
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-xl font-bold">No data available</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        ref={topRef}
        className="w-full p-4 border-b border-gray-300 bg-yellow-300 text-center"
      >
        <h2 className="text-center text-xl font-bold">KALYAN PANEL CHART</h2>
        <button
          onClick={() =>
            bottomRef.current?.scrollIntoView({ behavior: "smooth" })
          }
          className="mt-2 bg-pink-500 text-white py-2 px-4 rounded"
        >
          Go to Bottom
        </button>
      </div>

      <div className="w-[360px] mx-auto border-2 border-[#6D0B3E] rounded mt-4">
        <table className="w-full border-collapse text-xs table-fixed mb-2">
          <thead>
            <tr className="bg-[#6D0B3E] text-white">
              <th className="border border-gray-300 w-10">Week</th>
              {days.map((day) => (
                <th key={day} className="border border-gray-300 w-10">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const { startDate, toText, endDate } = splitDateRange(
                item["Week Date Range"]
              );
              return (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="border border-gray-300 text-center text-[8px] whitespace-pre-line leading-tight">
                    {startDate}
                    {toText && `\n${toText}\n`}
                    {endDate}
                  </td>
                  {days.map((day, dayIndex) => {
                    const dayValue = item[day] || "";
                    const differenceValue =
                      diffTotals.differences[index]?.[day];
                    const totalValue = diffTotals.totals[index]?.[day];

                    if (dayValue === "**") {
                      return (
                        <td
                          key={dayIndex}
                          className="border border-gray-300 p-0"
                        >
                          <div className="flex justify-center">
                            <div className="font-semibold text-black text-lg">
                              **
                            </div>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={dayIndex} className="border border-gray-300 p-0">
                        <div className="flex justify-center">
                          <div className="flex flex-col items-center">
                            <span className="text-gray-900 text-[10px] leading-none">
                              {dayValue && differenceValue}
                            </span>
                            <span
                              className={`font-semibold text-black text-xl leading-none ${
                                redMiddleNumbers.includes(
                                  formatMiddleValue(dayValue)
                                )
                                  ? "text-red-600"
                                  : ""
                              }`}
                            >
                              {formatMiddleValue(dayValue)}
                            </span>
                            <span className="text-gray-900 text-[10px] leading-none">
                              {dayValue && totalValue}
                            </span>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-4">
        <button
          onClick={() => topRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="mt-2 bg-pink-600 text-white py-2 px-6 rounded"
        >
          Go to Top
        </button>
      </div>
      <div ref={bottomRef} className="w-full p-4 border-t border-gray-200 mt-4">
        <h2 className="text-center text-xl font-bold">KALYAN JODI CHART</h2>
        <h3 className="text-center text-lg font-semibold">
          KALYAN JODI RESULT CHART RECORDS
        </h3>
      </div>
    </div>
  );
};

export default KalyanChart;
