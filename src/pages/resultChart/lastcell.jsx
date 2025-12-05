import React, { useState, useEffect } from "react";
import supabase from "../../supabase/supabaseClient";

const TableViewer = () => {
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

  const [lastCells, setLastCells] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function that takes a table name and fetches the last record.
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
    setLoading(true);
    setError(null);
    try {
      const cells = {};
      // Fetch data for each table concurrently.
      await Promise.all(
        tableNames.map(async (table) => {
          const record = await fetchLastRecord(table);
          if (record) {
            // Get an array of keys and iterate backwards to collect up to three non-null values.
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
            // Reverse the order so that the third from last becomes first,
            // second remains second, and the last becomes third.
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
      setError("Error fetching records. Check the console for more details.");
      console.error("Error in fetchAllLastCells:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when the component mounts.
  useEffect(() => {
    fetchAllLastCells();
  }, []);

  return (
    <div className="w-full px-1 py-2">
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="mb-4 border p-2">
        <p className="font-bold">kalyan panel</p>
        <p>
          {Array.isArray(lastCells["kalyan_panel"])
            ? lastCells["kalyan_panel"].join("-")
            : lastCells["kalyan_panel"]}
        </p>
      </div>

      <div className="mb-4 border p-2">
        <p className="font-bold">main mumbai</p>
        <p>
          {Array.isArray(lastCells["main_mumbai"])
            ? lastCells["main_mumbai"].join("-")
            : lastCells["main_mumbai"]}
        </p>
      </div>

      <div className="mb-4 border p-2">
        <p className="font-bold">milan day</p>
        <p>
          {Array.isArray(lastCells["milan_day"])
            ? lastCells["milan_day"].join("-")
            : lastCells["milan_day"]}
        </p>
      </div>

      <div className="mb-4 border p-2">
        <p className="font-bold">milan night</p>
        <p>
          {Array.isArray(lastCells["milan_night"])
            ? lastCells["milan_night"].join("-")
            : lastCells["milan_night"]}
        </p>
      </div>

      <div className="mb-4 border p-2">
        <p className="font-bold">madhur day</p>
        <p>
          {Array.isArray(lastCells["madhur_day"])
            ? lastCells["madhur_day"].join("-")
            : lastCells["madhur_day"]}
        </p>
      </div>

      <div className="mb-4 border p-2">
        <p className="font-bold">madhur night</p>
        <p>
          {Array.isArray(lastCells["madhur_night"])
            ? lastCells["madhur_night"].join("-")
            : lastCells["madhur_night"]}
        </p>
      </div>

      <div className="mb-4 border p-2">
        <p className="font-bold">rajdhani day</p>
        <p>
          {Array.isArray(lastCells["rajdhani_day"])
            ? lastCells["rajdhani_day"].join("-")
            : lastCells["rajdhani_day"]}
        </p>
      </div>

      <div className="mb-4 border p-2">
        <p className="font-bold">rajdhani night</p>
        <p>
          {Array.isArray(lastCells["rajdhani_night"])
            ? lastCells["rajdhani_night"].join("-")
            : lastCells["rajdhani_night"]}
        </p>
      </div>
    </div>
  );
};

export default TableViewer;
