import React, { useState, useEffect, useMemo } from "react";
import supabase from "../supabase/supabaseClient";

const DatabaseUpdate = ({ selectedChart, rowsToShow, onMatrixReady }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState([]);

  const days = useMemo(() => {
    if (columns.length === 17) return ["Mon", "Tue", "Wed", "Thu", "Fri"];
    if (columns.length === 20) return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    if (columns.length === 23) return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  }, [columns]);

  useEffect(() => {
    if (selectedChart) fetchRecords();
  }, [selectedChart, rowsToShow]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(selectedChart)
        .select("*")
        .order("id", { ascending: false })
        .limit(rowsToShow);

      if (error) throw error;

      const processed = data.reverse();
      setRecords(processed);
      setColumns(Object.keys(processed[0] || {}));

      // 🔥 Generate ROW WISE matrix
      const matrix = processed.map(row => {
        const rowArr = [];
        rowArr.push(row["Week Date Range"] ?? "");

        days.forEach(day => {
          rowArr.push(row[`${day}_OP`] ?? "");
          rowArr.push(row[day] ?? "");
          rowArr.push(row[`${day}_CP`] ?? "");
        });

        return rowArr;
      });

      console.log("MATRIX GENERATED:", matrix);

      if (onMatrixReady) onMatrixReady(matrix);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const splitPana = val => {
    if (!val || val === "None") return ["", "", ""];
    if (val === "***") return ["*", "*", "*"];
    return val.toString().split("");
  };

  const calculateTopDigit = (a, b) => {
    if (!a || !b) return "";
    const diff = +a > +b ? (+b + 10 - +a) : (+b - +a);
    return (diff % 10).toString();
  };

  const getParts = value => {
    if (!value || value === "None") return { top: "", main: "", bottom: "" };
    if (value === "**") return { top: "*", main: "**", bottom: "*" };

    const padded = value.toString().padStart(2, "0");
    return {
      top: calculateTopDigit(padded[0], padded[1]),
      main: padded,
      bottom: ((+padded[0] + +padded[1]) % 10).toString()
    };
  };

  return (
    <div className="w-full px-1 py-2">
      {loading && <div className="text-center py-4">Loading...</div>}

      {records.length > 0 && (
        <div className="overflow-x-auto md:overflow-visible">
          <div className="md:w-full md:max-w-xl">
            <table className="w-full border-collapse text-xs table-fixed">
              <thead>
                <tr className="bg-[#6D0B3E] text-white">
                  <th className="border border-gray-300 p-0 w-12 md:w-16">Week</th>
                  {days.map(day => (
                    <th key={day} className="border border-gray-300 p-0 md:w-12">{day}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {records.map((rec, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="border border-gray-300 text-center text-[8px] md:text-[10px] whitespace-pre-line">
                      {rec["Week Date Range"]?.replace(" to ", "\nto\n") ?? ""}
                    </td>

                    {days.map(day => {
                      const op = rec[`${day}_OP`] ?? "";
                      const mid = rec[day] ?? "";
                      const cp = rec[`${day}_CP`] ?? "";
                      const p = getParts(mid);

                      return (
                        <td key={day} className="border border-gray-300 p-0">
                          <div className="flex justify-center">
                            <div className="flex items-center">

                              <div className="flex flex-col items-center">
                                {splitPana(op).map((d, i) => (
                                  <span key={i} className="font-semibold text-[8px] md:text-xs">{d}</span>
                                ))}
                              </div>

                              <div className="flex flex-col items-center mx-1">
                                <span className="text-[8px] md:text-[10px]">{p.top}</span>
                                <span className="font-semibold text-black text-base md:text-xl">{p.main}</span>
                                <span className="text-[8px] md:text-[10px]">{p.bottom}</span>
                              </div>

                              <div className="flex flex-col items-center">
                                {splitPana(cp).map((d, i) => (
                                  <span key={i} className="font-semibold text-[8px] md:text-xs">{d}</span>
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
      )}
    </div>
  );
};

export default DatabaseUpdate;
