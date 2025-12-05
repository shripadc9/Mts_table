import React, { useState, useEffect, useMemo } from "react";
import supabase from "../../supabase/supabaseClient";

const DatabaseUpdate = ({ selectedChart }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [columns, setColumns] = useState([]);

  // Use the shared selectedChart prop as the table name.
  const tableName = selectedChart;

  const getPrimaryKey = () => {
    if (tableName === "kalyan_panel") return "id";
    return "id";
  };

  const days = useMemo(() => {
    if (columns.length === 17) return ["Mon", "Tue", "Wed", "Thu", "Fri"];
    else if (columns.length === 20)
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    else if (columns.length === 23)
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    else return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  }, [columns]);

  useEffect(() => {
    if (tableName) fetchRecords();
  }, [tableName]);

  const splitPana = (pana) => {
    if (!pana || pana === "None") return ["", "", ""];
    return pana === "***" ? ["*", "*", "*"] : pana.toString().split("");
  };

  const getJodiParts = (middleValue) => {
    if (!middleValue || middleValue === "None")
      return { top: "", main: "", bottom: "" };
    if (middleValue === "**") return { top: "*", main: "**", bottom: "*" };
    const paddedValue = middleValue.toString().padStart(2, "0");
    return {
      top: calculateTopDigit(paddedValue[0], paddedValue[1]),
      main: paddedValue,
      bottom: (
        (parseInt(paddedValue[0]) + parseInt(paddedValue[1])) %
        10
      ).toString(),
    };
  };

  const calculateTopDigit = (firstDigit, secondDigit) => {
    if (!firstDigit || !secondDigit) return "";
    const diff =
      parseInt(firstDigit) > parseInt(secondDigit)
        ? Math.abs(parseInt(secondDigit) + 10 - parseInt(firstDigit))
        : Math.abs(parseInt(secondDigit) - parseInt(firstDigit));
    return (diff % 10).toString();
  };

  const fetchRecords = async () => {
    if (!tableName) {
      setError("No table selected.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const primaryKey = "id";
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .order(primaryKey, { ascending: false })
        .limit(5);
      if (error) throw error;
      const processedData = data ? data.reverse() : [];
      setRecords(processedData);
      setColumns(Object.keys(processedData[0] || {}));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (records) => (
    <div className="overflow-x-auto md:overflow-visible">
      <div className="md:w-full md:max-w-xl">
        <table className="w-full border-collapse text-xs table-fixed">
          <thead>
            <tr className="bg-[#6D0B3E] text-white">
              <th className="border border-gray-300 p-0 w-12 md:w-16">Week</th>
              {days.map((day) => (
                <th key={day} className="border border-gray-300 p-0 md:w-12">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="border border-gray-300 text-center text-[8px] md:text-[10px] whitespace-pre-line leading-tight">
                  {record["Week Date Range"]?.replace(" to ", "\nto\n") || ""}
                </td>
                {days.map((day) => {
                  const op = record[`${day}_OP`] || "";
                  const middleValue = record[day] || "";
                  const cp = record[`${day}_CP`] || "";
                  const jodiParts = getJodiParts(middleValue);
                  return (
                    <td key={day} className="border border-gray-300 p-0">
                      <div className="flex justify-center">
                        <div className="flex items-center">
                          <div className="flex flex-col items-center">
                            {splitPana(op).map((digit, idx) => (
                              <span
                                key={idx}
                                className="font-semibold text-black text-[8px] md:text-xs leading-none"
                              >
                                {digit}
                              </span>
                            ))}
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-900 text-[8px] md:text-[10px] leading-none">
                              {jodiParts.top}
                            </span>
                            <span className="font-semibold text-black text-base md:text-xl leading-none">
                              {jodiParts.main}
                            </span>
                            <span className="text-gray-900 text-[8px] md:text-[10px] leading-none">
                              {jodiParts.bottom}
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            {splitPana(cp).map((digit, idx) => (
                              <span
                                key={idx}
                                className="font-semibold text-black text-[8px] md:text-xs leading-none"
                              >
                                {digit}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="w-full px-1 py-2">
      {loading && (
        <div className="text-center text-gray-600 py-4">Loading...</div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      <div className="flex justify-center">
        {records.length > 0
          ? renderTable(records)
          : tableName &&
            !loading && (
              <div className="text-center text-gray-600 py-4">
                No records found in the selected table.
              </div>
            )}
      </div>
    </div>
  );
};

export default DatabaseUpdate;
