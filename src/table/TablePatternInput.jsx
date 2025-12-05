import React, { useState } from "react";
import DatabaseUpdate from "./ExtraTable";
import ResultsDisplay from "./ResultDisplay";

const TablePatternInput = () => {
  const [selectedChart, setSelectedChart] = useState("kalyan_panel");
  const [rowsToShow, setRowsToShow] = useState(5);
  const [patternInput, setPatternInput] = useState("");
  const [matrixData, setMatrixData] = useState([]);
  const [responseMessage, setResponseMessage] = useState("");
  const [apiData, setApiData] = useState(null);

  const API_URL = "https://tableapimain.onrender.com/api/table-pattern-check";

  const sendRequestToServer = async (payload) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Backend not responding");
    }

    return res.json();
  };

  const handleSubmit = async () => {
    if (!patternInput.trim()) {
      setResponseMessage("⚠ Enter Pattern!");
      return;
    }

    const payload = {
      chart: selectedChart,
      pattern: patternInput,
      weeks: rowsToShow,
      matrix: matrixData,
    };

    setResponseMessage("⏳ Processing request, please wait...");

    try {
      // First try
      const data = await sendRequestToServer(payload);
      setApiData(data);
      setResponseMessage("✅ Success!");
    } catch (err) {
      // Backend may be sleeping — retry
      console.warn("⚠ First request failed, retrying after wake-up...");

      try {
        setResponseMessage("⚡ Retrying...");
        await new Promise((res) => setTimeout(res, 1200)); // wait 1 sec

        const data = await sendRequestToServer(payload);
        setApiData(data);
        setResponseMessage("🔥 Response received after retry");
      } catch (err2) {
        console.log(err2);
        setResponseMessage("❌ Server not responding. Try again.");
      }
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">

      <h1 className="text-xl font-bold text-center text-[#6D0B3E]">
        Table Pattern Input
      </h1>

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

      <select
        className="border p-2 w-full mt-3"
        value={rowsToShow}
        onChange={(e) => setRowsToShow(+e.target.value)}
      >
        {[5, 6, 7, 8, 9, 10, 15, 20, 30].map(n => (
          <option key={n} value={n}>
            Last {n}
          </option>
        ))}
      </select>

      <div className="mt-4">
        <DatabaseUpdate
          selectedChart={selectedChart}
          rowsToShow={rowsToShow}
          onMatrixReady={setMatrixData}
        />
      </div>

      <input
        className="border w-full p-2 mt-4"
        placeholder="Enter Pattern separated by commas"
        value={patternInput}
        onChange={(e) => setPatternInput(e.target.value)}
      />

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

      {responseMessage && (
        <p className="font-bold text-center mt-4">
          {responseMessage}
        </p>
      )}

      {apiData && (
        <div className="mt-6">
          <ResultsDisplay apiData={apiData} />
        </div>
      )}
    </div>
  );
};

export default TablePatternInput;
