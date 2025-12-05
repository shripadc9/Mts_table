import React, { useState, useEffect } from "react";
import PatternResultDisplay from "./PatternResultDisplay";
import DatabaseUpdate from "./ExtraTable";
import { Link } from "react-router-dom";

// Import Firestore functions for submit count update and querying
import {
  doc,
  updateDoc,
  increment,
  getDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import { fireDB } from "../../firebase/FirebaseConfig";

const PatternSection = ({
  patternNumber,
  pattern,
  onCellChange,
  chartConfig,
}) => {
  const weekDays = chartConfig.weekDays;
  const columnCount = chartConfig.columnCount;

  return (
    <div className="overflow-x-auto w-full sm:w-3/4 mx-auto">
      <h2 className="text-sm font-semibold mb-2 text-center text-gray-800">
        {chartConfig.chartName} Pattern {patternNumber}
      </h2>
      <div
        className={`grid ${chartConfig.gridCols} border border-gray-400 overflow-hidden w-full mx-auto`}
        style={{ borderRadius: "0" }}
      >
        {/* Header Row */}
        {weekDays.slice(0, columnCount).map((day, index) => (
          <div
            key={index}
            className="bg-[#6D0B3E] text-white text-center font-normal text-s border-r border-b border-gray-400 flex items-center justify-center"
            style={{ height: "30px", width: "100%" }}
          >
            {day}
          </div>
        ))}

        {/* Data Rows */}
        {pattern.map((row, rowIndex) =>
          row.map((cell, cellIndex) => (
            <div
              key={`${rowIndex}-${cellIndex}`}
              className="border border-gray-300 aspect-square flex items-center justify-center bg-white"
            >
              <input
                type="text"
                value={cell}
                onChange={(e) =>
                  onCellChange(rowIndex, cellIndex, e.target.value)
                }
                className="w-full h-full text-center border-none focus:outline-none focus:ring-1 focus:ring-black text-2xl font-normal p-1"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const PatternInput = () => {
  const [rows, setRows] = useState(
    () => parseInt(localStorage.getItem("rows")) || 3
  );
  const [selectedChart, setSelectedChart] = useState(
    () => localStorage.getItem("selectedChart") || "kalyan_panel"
  );
  const [patterns, setPatterns] = useState(() => {
    const savedPatterns = localStorage.getItem("patterns");
    return savedPatterns ? JSON.parse(savedPatterns) : {};
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [processedMatrix, setProcessedMatrix] = useState(() => {
    const savedMatrix = localStorage.getItem("processedMatrix");
    return savedMatrix ? JSON.parse(savedMatrix) : null;
  });
  // Default live-sync is off.
  const [syncCells, setSyncCells] = useState(false);

  const chartConfig = {
    kalyan_panel: {
      chartName: "Kalyan Chart",
      weekDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      columnCount: 6,
      gridCols: "grid-cols-6",
    },
    main_mumbai: {
      chartName: "Main Mumbai Chart",
      weekDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      columnCount: 5,
      gridCols: "grid-cols-5",
    },
    milan_night: {
      chartName: "Milan Night Chart",
      weekDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      columnCount: 6,
      gridCols: "grid-cols-6",
    },
    milan_day: {
      chartName: "Milan Day Chart",
      weekDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      columnCount: 7,
      gridCols: "grid-cols-7",
    },
    madhur_day: {
      chartName: "Madhur Day Chart",
      weekDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      columnCount: 7,
      gridCols: "grid-cols-7",
    },
    madhur_night: {
      chartName: "Madhur Night Chart",
      weekDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      columnCount: 6,
      gridCols: "grid-cols-6",
    },
    rajdhani_day: {
      chartName: "Rajdhani Day Chart",
      weekDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      columnCount: 6,
      gridCols: "grid-cols-6",
    },
    rajdhani_night: {
      chartName: "Rajdhani Night Chart",
      weekDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      columnCount: 5,
      gridCols: "grid-cols-5",
    },
  };

  // Reinitialize patterns when the chart or row count changes.
  const initializePatterns = () => {
    const config = chartConfig[selectedChart];
    const newPatterns = {};
    for (let i = 1; i <= 3; i++) {
      newPatterns[`pattern${i}`] = Array.from({ length: rows }, () =>
        Array.from({ length: config.columnCount }, () => "")
      );
    }
    setPatterns(newPatterns);
    setProcessedMatrix(null);
  };

  useEffect(() => {
    localStorage.setItem("rows", rows);
    localStorage.setItem("selectedChart", selectedChart);
    localStorage.setItem("patterns", JSON.stringify(patterns));
    localStorage.setItem("processedMatrix", JSON.stringify(processedMatrix));
  }, [rows, selectedChart, patterns, processedMatrix]);

  useEffect(() => {
    if (rows > 0) initializePatterns();
  }, [rows, selectedChart]);

  // When syncCells is toggled to true, update other patterns with Pattern 1's data.
  useEffect(() => {
    if (syncCells) {
      const newPatterns = { ...patterns };
      newPatterns.pattern2 = patterns.pattern1.map((row) => [...row]);
      newPatterns.pattern3 = patterns.pattern1.map((row) => [...row]);
      setPatterns(newPatterns);
    }
  }, [syncCells]);

  const handleRowChange = (e) => {
    const value = e.target.value;
    const parsedValue = parseInt(value, 10);
    if (value === "") {
      setRows(0);
      setErrorMessage("");
      setResponseMessage("");
      setProcessedMatrix(null);
    } else if (parsedValue >= 1 && parsedValue <= 10) {
      setRows(parsedValue);
      setErrorMessage("");
      setResponseMessage("");
      setProcessedMatrix(null);
    } else {
      setErrorMessage("Please enter a number between 1 and 10.");
    }
  };

  const handleChartChange = (e) => {
    setSelectedChart(e.target.value);
    setResponseMessage("");
    setProcessedMatrix(null);
  };

  const handleCellChange = (patternKey, rowIndex, cellIndex, value) => {
    const newPatterns = { ...patterns };
    if (syncCells) {
      Object.keys(newPatterns).forEach((key) => {
        newPatterns[key][rowIndex][cellIndex] = value;
      });
    } else {
      newPatterns[patternKey][rowIndex][cellIndex] = value;
    }
    setPatterns(newPatterns);
    setErrorMessage("");
    setResponseMessage("");
    setProcessedMatrix(null);
  };

  const validatePatterns = () => {
    const pattern2HasInput = patterns.pattern2.some((row) =>
      row.some((cell) => cell.trim() !== "")
    );
    const pattern3HasInput = patterns.pattern3.some((row) =>
      row.some((cell) => cell.trim() !== "")
    );
    if (!pattern2HasInput || !pattern3HasInput) {
      setErrorMessage(
        "Please enter at least one value in Pattern 2 and Pattern 3."
      );
      return false;
    }
    return true;
  };

  const handleClear = () => {
    initializePatterns();
    setErrorMessage("");
    setResponseMessage("");
    setProcessedMatrix(null);
    localStorage.removeItem("patterns");
    localStorage.removeItem("processedMatrix");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePatterns()) return;

    const formattedData = {
      chart: selectedChart,
      pattern1: patterns.pattern1,
      pattern2: patterns.pattern2,
      pattern3: patterns.pattern3,
    };

    // Replace any empty cells with "None"
    Object.keys(formattedData)
      .filter((key) => key.startsWith("pattern"))
      .forEach((patternKey) => {
        formattedData[patternKey] = formattedData[patternKey].map((row) =>
          row.map((cell) => (cell === "" ? "None" : cell))
        );
      });

    try {
      //https://patternapi.onrender.com
      const response = await fetch("https://patternapiupdated.onrender.com/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([formattedData]),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      console.log("Response from server:", result);
      if (result.processedMatrix && result.tableName) {
        setResponseMessage(result.message);
        setProcessedMatrix(result.processedMatrix);

        // --- Update Firebase Submit Count using user email from localStorage ---
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser && storedUser.email) {
          const usersRef = collection(fireDB, "users");
          const q = query(usersRef, where("email", "==", storedUser.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDocRef = querySnapshot.docs[0].ref;
            await updateDoc(userDocRef, {
              submitCount: increment(1),
            });
            console.log(
              "Submit count updated successfully for user:",
              storedUser.email
            );
          } else {
            console.error(
              "User document not found for email:",
              storedUser.email
            );
          }
        } else {
          console.error("No user found in localStorage.");
        }
        // -----------------------------------------------------------------------
      } else {
        setErrorMessage("Pattern Not Available In Chart");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      setErrorMessage("Failed to submit data. Please try again.");
    }
  };

  return (
    <div className="mb-8">
      <div className="container mx-auto px-1 py-1 max-w-md bg-gray-100 min-h-screen">
        <div className="bg-white p-8 w-full mx-auto">
          <h1
            className="text-xl font-bold mb-6 text-center"
            style={{ color: "#6D0B3E" }}
          >
            {chartConfig[selectedChart].chartName} Pattern Finder
          </h1>

          {/* Chart Selector */}
          <div className="mb-4 text-center">
            <label className="block mb-2 text-sm font-semibold text-gray-800">
              Select a Chart:
            </label>
            <select
              value={selectedChart}
              onChange={handleChartChange}
              className="border border-gray-300 p-2 w-full text-sm focus:ring-2 focus:ring-[#6D0B3E] rounded bg-white text-black"
              required
            >
              <option value="kalyan_panel">Kalyan Chart</option>
              <option value="main_mumbai">Main Mumbai Chart</option>
              <option value="milan_day">Milan Day Chart</option>
              <option value="milan_night">Milan Night Chart</option>
              <option value="madhur_day">Madhur Day Chart</option>
              <option value="madhur_night">Madhur Night Chart</option>
              <option value="rajdhani_day">Rajdhani Day Chart</option>
              <option value="rajdhani_night">Rajdhani Night Chart</option>
            </select>
          </div>

          {/* Shared DatabaseUpdate Component */}
          <DatabaseUpdate selectedChart={selectedChart} />

          <form onSubmit={handleSubmit} className="mb-2">
            <div className="mb-2 text-center">
              <label className="block mb-2 text-sm font-semibold text-gray-800">
                Number of Rows (1-10):
              </label>
              <input
                type="number"
                value={rows === 0 ? "" : rows}
                onChange={handleRowChange}
                min="1"
                max="10"
                className="border border-gray-300 p-2 w-32 text-center text-sm focus:ring-2 focus:ring-[#6D0B3E] rounded mx-auto"
              />
              {errorMessage && (
                <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
              )}
            </div>

            <div className="space-y-1">
              {Object.keys(patterns).map((patternKey, index) => (
                <PatternSection
                  key={patternKey}
                  patternNumber={index + 1}
                  pattern={patterns[patternKey]}
                  onCellChange={(rowIndex, cellIndex, value) =>
                    handleCellChange(patternKey, rowIndex, cellIndex, value)
                  }
                  chartConfig={chartConfig[selectedChart]}
                />
              ))}
            </div>

            {/* Checkbox to toggle live-sync */}
            <div className="mt-4 text-center">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={syncCells}
                  onChange={() => setSyncCells(!syncCells)}
                  className="form-checkbox"
                />
                <span className="ml-2 text-sm font-semibold text-gray-800">
                  Apply Same Numbers to All Patterns
                </span>
              </label>
            </div>

            {errorMessage && (
              <div className="text-red-500 text-sm mt-4 text-center">
                {errorMessage}
              </div>
            )}

            <div className="text-center mt-6 space-x-4">
              <button
                type="submit"
                disabled={rows === 0 || !selectedChart}
                className="bg-[#6D0B3E] text-white px-6 py-3 text-sm hover:bg-[#6D0B3E]/80 transition-all rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6D0B3E] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Data
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="bg-[#6D0B3E] text-white px-6 py-3 text-sm hover:bg-[#6D0B3E]/80 transition-all rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6D0B3E] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear All
              </button>
            </div>
            <div className="p-4 text-center">
              <Link
                to="/information-page"
                className="text-blue-600 hover:underline"
              >
                Click here to learn how to use software
              </Link>
            </div>

            {responseMessage && (
              <div className="mt-6 text-center text-bold text-green-500">
                {responseMessage}
              </div>
            )}
          </form>
        </div>
      </div>

      {processedMatrix && (
        <PatternResultDisplay
          processedMatrix={processedMatrix}
          tableName={selectedChart}
        />
      )}
    </div>
  );
};

export default PatternInput;
