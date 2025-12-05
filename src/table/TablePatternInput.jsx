import React, { useState } from "react";
import DatabaseUpdate from "./ExtraTable";
import ResultsDisplay from "./ResultDisplay"; // NEW

const TablePatternInput = () => {
  const [selectedChart, setSelectedChart] = useState("kalyan_panel");
  const [rowsToShow, setRowsToShow] = useState(5);
  const [patternInput, setPatternInput] = useState("");
  const [matrixData, setMatrixData] = useState([]);
  const [responseMessage, setResponseMessage] = useState("");
  const [apiData, setApiData] = useState(null);

  const handleSubmit = async () => {
    setResponseMessage("");

    // 1️⃣ Validate Pattern input
    if (!patternInput.trim()) {
      setResponseMessage("⚠ Enter Pattern!");
      return;
    }

    if (!patternInput.includes(",")) {
      setResponseMessage("⚠ Enter pattern like 4,0,6,7");
      return;
    }

    // 2️⃣ Validate Table Loaded
    if (!matrixData || matrixData.length === 0) {
      setResponseMessage("⚠ Please wait for table to load!");
      return;
    }

    // 3️⃣ Create request payload
    const payload = {
      chart: selectedChart,
      pattern: patternInput,
      weeks: rowsToShow,
      matrix: matrixData,
    };

    try {
      const res = await fetch(
        "https://tableapimain.onrender.com/api/table-pattern-check",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        setResponseMessage("❌ Server unreachable!");
        return;
      }

      const data = await res.json();

      if (!data.status) {
        setResponseMessage("❌ Pattern not matched!");
        return;
      }

      setApiData(data);
      setResponseMessage(data.message);

    } catch (err) {
      console.log("API ERROR: ", err);
      setResponseMessage("❌ Network/API Failed!");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1
        className="text-xl font-bold text-center"
        style={{ color: "#6D0B3E" }}
      >
        Table Pattern Input
      </h1>

      {/* Chart Selection */}
      <select
        className="border p-2 w-full mt-4"
        value={selectedChart}
        onChange={(e) => setSelectedChart(e.target.value)}
      >
        <option value="kalyan_panel">Kalyan</option>
        <option value="main_mumbai">Main Mumbai</option>
        <option value="milan_day">Milan Day</option>
        <option value="milan_night">Milan Night</option>
        <option value="madhur_day">Madhur Day</option>
        <option value="madhur_night">Madhur Night</option>
        <option value="rajdhani_day">Rajdhani Day</option>
        <option value="rajdhani_night">Rajdhani Night</option>
      </select>

      {/* Weeks */}
      <select
        className="border w-full p-2 mt-3"
        value={rowsToShow}
        onChange={(e) => setRowsToShow(+e.target.value)}
      >
        {[5, 6, 7, 8, 9, 10, 15, 20, 30].map((n) => (
          <option key={n} value={n}>
            Last {n}
          </option>
        ))}
      </select>

      {/* Table Component */}
      <div className="mt-4">
        <DatabaseUpdate
          selectedChart={selectedChart}
          rowsToShow={rowsToShow}
          onMatrixReady={setMatrixData}
        />
      </div>

      {/* Pattern input */}
      <input
        className="border w-full p-2 mt-4"
        placeholder="Enter Pattern (e.g. 4,0,6,7)"
        value={patternInput}
        onChange={(e) => setPatternInput(e.target.value)}
      />

      {/* Submit Buttons */}
      <div className="mt-4 flex justify-center gap-3">
        <button
          className="bg-[#6D0B3E] text-white px-5 py-2 rounded"
          onClick={handleSubmit}
        >
          Submit
        </button>

        <button
          className="bg-gray-600 text-white px-5 py-2 rounded"
          onClick={() => {
            setResponseMessage("");
            setApiData(null);
          }}
        >
          Clear
        </button>
      </div>

      {/* Response Message */}
      {responseMessage && (
        <p className="text-green-700 font-bold text-center mt-4">
          {responseMessage}
        </p>
      )}

      {/* Display API Results */}
      {apiData && (
        <div className="mt-6">
          <ResultsDisplay apiData={apiData} />
        </div>
      )}
    </div>
  );
};

export default TablePatternInput;
