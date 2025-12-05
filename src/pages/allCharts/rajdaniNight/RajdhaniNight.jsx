import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import useSWR from "swr";
import supabase from "../../../supabase/supabaseClient";

// Fetch function for SWR
const fetcher = async () => {
  const { data, error } = await supabase
    .from("rajdhani_night")
    .select("*")
    .order("id", { ascending: false });
  if (error) throw error;
  return data.reverse();
};

// Memoized cell component for better performance
const TableCell = React.memo(
  ({
    day,
    item,
    differences,
    totals,
    redMiddleNumbers,
    formatMiddleValue,
    renderVertical,
  }) => {
    const dayValue = item[day] || "";
    const opValue = item[`${day}_OP`] || "";
    const cpValue = item[`${day}_CP`] || "";
    const differenceValue = differences[day];
    const totalValue = totals[day];

    return (
      <td className="border border-gray-200 p-1 text-sm text-black">
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
                    redMiddleNumbers.includes(formatMiddleValue(dayValue, true))
                      ? "text-red-600"
                      : ""
                  }`}
                >
                  {formatMiddleValue(dayValue, true)}
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
  }
);

// Memoized table row component
const TableRow = React.memo(
  ({
    item,
    index,
    differences,
    totals,
    days,
    splitDateRange,
    formatMiddleValue,
    renderVertical,
    redMiddleNumbers,
  }) => {
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
        {days.map((day, dayIndex) => (
          <TableCell
            key={dayIndex}
            day={day}
            item={item}
            differences={differences[index]}
            totals={totals[index]}
            redMiddleNumbers={redMiddleNumbers}
            formatMiddleValue={formatMiddleValue}
            renderVertical={renderVertical}
          />
        ))}
      </tr>
    );
  }
);

const RajdhaniNightChart = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const bottomRef = useRef(null);
  const topRef = useRef(null);

  // Manual refresh state for last updated time
  const [lastUpdated, setLastUpdated] = useState(new Date());

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

  // Use SWR for data fetching with caching and auto-refresh every 2 hours
  const {
    data: rawData,
    error,
    mutate,
    isLoading,
  } = useSWR("rajdhani_night_data", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 2 * 60 * 60 * 1000, // 5 minutes
    refreshInterval: 2 * 60 * 60 * 1000, // Auto-refresh every 2 hours
    suspense: false,
    onError: (err) => console.error("SWR error:", err),
  });

  // Update last updated time whenever new data is fetched
  useEffect(() => {
    if (rawData) {
      setLastUpdated(new Date());
    }
  }, [rawData]);

  // Process data
  const data = useMemo(() => {
    if (!rawData) return [];
    return rawData.map(({ id, ...rest }) => rest);
  }, [rawData]);

  // Calculate differences (memoized)
  const differences = useMemo(() => {
    const diffObj = {};
    data.forEach((item, index) => {
      const diffByWeek = {};
      days.forEach((day) => {
        let middleValue = item[day];
        if (middleValue === "**") {
          diffByWeek[day] = "*";
        } else {
          const numValue = parseInt(middleValue, 10) || 0;
          if (numValue < 10) {
            diffByWeek[day] = numValue;
          } else {
            const firstDigit = Math.floor(numValue / 10);
            const secondDigit = numValue % 10;
            diffByWeek[day] = Math.abs(firstDigit - secondDigit);
          }
        }
      });
      diffObj[index] = diffByWeek;
    });
    return diffObj;
  }, [data, days]);

  // Calculate totals (memoized)
  const totals = useMemo(() => {
    const calculateTotal = (middleValue) => {
      if (middleValue === "**") return "*";
      const numValue = parseInt(middleValue, 10) || 0;
      if (numValue < 10) return numValue;
      const firstDigit = Math.floor(numValue / 10);
      const secondDigit = numValue % 10;
      const sum = firstDigit + secondDigit;
      return sum % 10;
    };

    const totalObj = {};
    data.forEach((item, index) => {
      const totalByWeek = {};
      days.forEach((day) => {
        totalByWeek[day] = calculateTotal(item[day]);
      });
      totalObj[index] = totalByWeek;
    });
    return totalObj;
  }, [data, days]);

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

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const goHome = useCallback(() => {
    window.location.href = "/";
  }, []);

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    mutate();
    setLastUpdated(new Date());
  }, [mutate]);

  if (isLoading || !rawData) {
    return (
      <div className="text-center text-xl font-bold mt-10">
        The chart is loading. Please wait a moment...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-xl font-bold mt-10 text-red-600">
        Failed to load data. Please try again.
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Top section with header, refresh button, and last updated time */}
      <div
        ref={topRef}
        className="w-full p-4 border-b border-gray-300 bg-yellow-300 text-center"
      >
        <h2 className="text-center text-xl font-bold">
          RAJDHANI NIGHT PANEL CHART
        </h2>
        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={() =>
              bottomRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            className="bg-pink-600 text-white py-2 px-4 rounded"
          >
            Go to Bottom
          </button>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white py-2 px-4 rounded"
          >
            Refresh Data
          </button>
          <button
            onClick={goHome}
            className="bg-green-600 text-white py-2 px-4 rounded"
          >
            Home
          </button>
        </div>
        <p className="text-sm text-gray-700 mt-2">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      {/* Main table content */}
      <div className="w-full border-2 border-pink-500 shadow-md p-2 overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200 shadow-md">
          <thead className="bg-[#ad4b7e] text-white">
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
            {data.map((item, index) => (
              <TableRow
                key={index}
                item={item}
                index={index}
                differences={differences}
                totals={totals}
                days={days}
                splitDateRange={splitDateRange}
                formatMiddleValue={formatMiddleValue}
                renderVertical={renderVertical}
                redMiddleNumbers={redMiddleNumbers}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom section with scroll and home buttons */}
      <div className="text-center mt-4 flex justify-center gap-4">
        <button
          onClick={scrollToTop}
          className="bg-pink-600 text-white py-2 px-6 rounded"
        >
          Go to Top
        </button>
        <button
          onClick={goHome}
          className="bg-green-600 text-white py-2 px-6 rounded"
        >
          Home
        </button>
      </div>

      <div ref={bottomRef} className="w-full p-4 border-t border-gray-200 mt-4">
        <h2 className="text-center text-xl font-bold">
          RAJDHANI NIGHT PANEL CHART
        </h2>
        <h3 className="text-center text-lg font-semibold">
          RAJDHANI NIGHT PANEL RESULT CHART RECORDS
        </h3>
      </div>
    </div>
  );
};

export default RajdhaniNightChart;
