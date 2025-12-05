import React from "react";
import MatchTable from "./MatchTable";

const ResultsDisplay = ({ apiData }) => {
  if (!apiData) return null;

  return (
    <div className="mt-6 p-4">
      <h2 className="text-center text-lg font-bold text-white bg-[#6D0B3E] py-2 rounded-md">
        Pattern Results
      </h2>

      <div className="bg-yellow-100 p-3 rounded-md my-4 shadow">
        <p className="font-semibold">
          Pattern:
          <span className="text-red-700 ml-2">{apiData.inputPattern?.join(", ")}</span>
        </p>
      </div>

      <h2 className="font-bold text-lg">PAIRWISE RESULTS</h2>
      {apiData.pairwiseResults.map((m, idx) => (
        <MatchTable key={idx} title={`Pairwise Match ${idx + 1}`} match={m} />
      ))}

      <h2 className="font-bold text-lg mt-6">TRIPLET RESULTS</h2>
      {apiData.tripletResults.map((m, idx) => (
        <MatchTable key={idx} title={`Triplet Match ${idx + 1}`} match={m} />
      ))}
    </div>
  );
};

export default ResultsDisplay;
