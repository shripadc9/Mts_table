import React, { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import supabase from "../../supabase/supabaseClient";

// List of all table names.
const tableNames = [
  "kalyan_panel",
  "main_mumbai",
  "milan_day",
  "milan_night",
  "madhur_day",
  "madhur_night",
  "rajdhani_day",
  "rajdhani_night",
];

const LiveMatkaResult = () => {
  // State for the last cells fetched from individual tables.
  const [lastCells, setLastCells] = useState({});
  const [cellsLoading, setCellsLoading] = useState(false);
  const [cellsError, setCellsError] = useState(null);

  // Helper function to fetch the last record from a table.
  const fetchLastRecord = async (tableName) => {
    try {
      console.log(`Fetching record for table: ${tableName}`);
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .order("id", { ascending: false })
        .limit(1);
      if (error) throw error;
      console.log(`Data for ${tableName}:`, data);
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      console.error(`Error fetching from ${tableName}:`, err.message);
      throw err;
    }
  };

  // Function to fetch the previous three non-null cell values for each table.
  const fetchAllLastCells = async () => {
    setCellsLoading(true);
    setCellsError(null);
    try {
      const cells = {};
      // Fetch data for each table concurrently.
      await Promise.all(
        tableNames.map(async (table) => {
          const record = await fetchLastRecord(table);
          if (record) {
            // Iterate backwards over keys to collect up to three non-null values.
            const keys = Object.keys(record);
            let foundValues = [];
            for (
              let i = keys.length - 1;
              i >= 0 && foundValues.length < 3;
              i--
            ) {
              const value = record[keys[i]];
              if (value !== null && value !== undefined && value !== "") {
                foundValues.push(value);
              }
            }
            // Reverse the order so that the earliest of the three becomes first.
            cells[table] =
              foundValues.length > 0
                ? foundValues.reverse()
                : "All cells are null";
          } else {
            cells[table] = "No record";
          }
        })
      );
      console.log("Final cells object:", cells);
      setLastCells(cells);
    } catch (err) {
      setCellsError(
        "Error fetching records. Check the console for more details."
      );
      console.error("Error in fetchAllLastCells:", err);
    } finally {
      setCellsLoading(false);
    }
  };

  // Fetch last cells data when the component mounts.
  useEffect(() => {
    fetchAllLastCells();
  }, []);

  // Static data with presentation properties that also use lastCells values.
  const staticData = [
    {
      color: "green",
      jodiLink: "/kalyan-panel",
      panelLink: "/kalyan-panel",
      result: Array.isArray(lastCells["kalyan_panel"])
        ? lastCells["kalyan_panel"].join("-")
        : lastCells["kalyan_panel"],
    },
    {
      color: "red",
      jodiLink: "/main-bazar-panel",
      panelLink: "/main-mumbai-panel",
      result: Array.isArray(lastCells["main_mumbai"])
        ? lastCells["main_mumbai"].join("-")
        : lastCells["main_mumbai"],
    },
    {
      color: "green",
      jodiLink: "/milan-day-panel",
      panelLink: "/milan-day-panel",
      result: Array.isArray(lastCells["milan_day"])
        ? lastCells["milan_day"].join("-")
        : lastCells["milan_day"],
    },
    {
      color: "red",
      jodiLink: "/milan-night-panel",
      panelLink: "/milan-night-panel",
      result: Array.isArray(lastCells["milan_night"])
        ? lastCells["milan_night"].join("-")
        : lastCells["milan_night"],
    },
    {
      color: "green",
      jodiLink: "/madhur-day-panel",
      panelLink: "/madhur-day-panel",
      result: Array.isArray(lastCells["madhur_day"])
        ? lastCells["madhur_day"].join("-")
        : lastCells["madhur_day"],
    },
    {
      color: "yellow",
      jodiLink: "/madhur-night-panel",
      panelLink: "/madhur-night-panel",
      result: Array.isArray(lastCells["madhur_night"])
        ? lastCells["madhur_night"].join("-")
        : lastCells["madhur_night"],
    },
    {
      color: "green",
      jodiLink: "/rajdhani-day-panel",
      panelLink: "/rajdhani-day-panel",
      result: Array.isArray(lastCells["rajdhani_day"])
        ? lastCells["rajdhani_day"].join("-")
        : lastCells["rajdhani_day"],
    },
    {
      color: "red",
      jodiLink: "/rajdhani-night-panel",
      panelLink: "/rajdhani-night-panel",
      result: Array.isArray(lastCells["rajdhani_night"])
        ? lastCells["rajdhani_night"].join("-")
        : lastCells["rajdhani_night"],
    },
  ];

  // Data fetching function using supabase for main results.
  const fetcher = async () => {
    const { data, error } = await supabase
      .from("matka_results")
      .select("*")
      .order("id", { ascending: true });
    if (error) throw error;
    return data;
  };

  // SWR hook for fetching matka_results.
  const {
    data: results,
    error: swrError,
    isValidating,
    mutate,
  } = useSWR("matka_results", fetcher, {
    refreshInterval: 2 * 60 * 60 * 1000, // auto-refresh every 2 hours
    dedupingInterval: 2 * 60 * 60 * 1000, // prevent duplicate requests within 2 hours
  });

  // Determine if main results are still loading.
  const resultsLoading = !results && !swrError;

  // Merge dynamic results with static presentation properties.
  const mergedResults = useMemo(() => {
    if (!results) return [];
    return results.map((result, index) => ({
      ...result,
      ...staticData[index],
    }));
  }, [results, staticData]);

  // Handler for manual refresh.
  const handleRefresh = () => {
    mutate();
  };

  // Result item component.
  const ResultItem = React.memo(
    ({ title, result, time, color, jodiLink, panelLink }) => {
      return (
        <div className="w-full p-2 border border-gray-200 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between gap-1">
            {/* Left Button */}
            <div className="w-[120px]">
              <a
                href={jodiLink}
                className="bg-[#6D0B3E] text-white text-sm sm:text-base px-4 py-1.5 rounded inline-block text-center hover:bg-[#8B0D4F] transition-colors"
              >
                Jodi
              </a>
            </div>
            {/* Middle Content */}
            <div className="flex-1 text-center px-1 max-w-full">
              <h2
                className={`text-base sm:text-lg font-bold text-${
                  color || "black"
                }-700 leading-tight whitespace-nowrap overflow-hidden text-ellipsis`}
              >
                {title}
              </h2>
              <p className="text-black text-sm sm:text-base font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                {result}
              </p>
              <p className="text-red-500 text-xs">{time}</p>
            </div>
            {/* Right Button */}
            <div className="w-[120px] text-right">
              <a
                href={panelLink}
                className="bg-[#6D0B3E] text-white text-sm sm:text-base px-4 py-1.5 rounded inline-block text-center hover:bg-[#8B0D4F] transition-colors"
              >
                Panel
              </a>
            </div>
          </div>
        </div>
      );
    }
  );

  // Skeleton loading component.
  const ResultSkeleton = () => (
    <div className="w-full p-2 border border-gray-200 bg-white rounded-lg shadow-sm animate-pulse">
      <div className="flex items-center justify-between gap-1">
        <div className="w-[120px]">
          <div className="bg-gray-300 h-8 rounded w-full"></div>
        </div>
        <div className="flex-1 text-center px-1">
          <div className="bg-gray-300 h-6 rounded w-3/4 mx-auto mb-1"></div>
          <div className="bg-gray-300 h-5 rounded w-1/2 mx-auto mb-1"></div>
          <div className="bg-gray-300 h-4 rounded w-1/3 mx-auto"></div>
        </div>
        <div className="w-[120px]">
          <div className="bg-gray-300 h-8 rounded w-full ml-auto"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100">
      <div className="w-full max-w-full mx-auto px-2 py-2">
        {/* Header with refresh button */}
        <div className="bg-[#6D0B3E] rounded-lg px-2 py-2 mb-2 flex justify-between items-center">
          <h1 className="text-base sm:text-xl md:text-2xl font-bold text-white text-center flex-1">
            LIVE MATKA RESULT
          </h1>
          <button
            onClick={handleRefresh}
            disabled={isValidating}
            className="text-white text-sm px-2 py-1 rounded hover:bg-[#8B0D4F] disabled:opacity-50"
          >
            {isValidating ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Divider */}
        <div className="h-1 bg-[#6D0B3E] rounded-full mb-2"></div>

        {/* Error message */}
        {(swrError || cellsError) && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mb-2 rounded">
            {swrError?.message || cellsError || "Failed to fetch results"}
          </div>
        )}

        {/* Results Grid with Skeleton Loading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {(resultsLoading || cellsLoading) &&
            Array.from({ length: 8 }).map((_, index) => (
              <ResultSkeleton key={`skeleton-${index}`} />
            ))}
          {!(resultsLoading || cellsLoading) &&
            mergedResults.map((item, idx) => (
              // Using idx as fallback key if item.id is not available.
              <ResultItem key={item.id || idx} {...item} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(LiveMatkaResult);
