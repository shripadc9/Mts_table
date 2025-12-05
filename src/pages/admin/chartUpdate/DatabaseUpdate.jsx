import React, { useState, useEffect, useMemo } from "react";
import supabase from "../../../supabase/supabaseClient";

const DatabaseUpdate = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [tableName, setTableName] = useState(
    () => localStorage.getItem("selectedTable") || ""
  );
  const [formData, setFormData] = useState({});
  const [editingRecord, setEditingRecord] = useState(null);
  const [columns, setColumns] = useState([]);

  const tables = [
    "kalyan_panel",
    "main_mumbai",
    "milan_night",
    "milan_day",
    "madhur_night",
    "madhur_day",
    "rajdhani_night",
    "rajdhani_day",
  ];

  // Helper: Return the primary key based on table name.
  // For example, if kalyan_panel uses uppercase "ID" and others use lowercase "id"
  const getPrimaryKey = () => {
    if (tableName === "kalyan_panel") return "id";
    return "id";
  };

  // Compute days based on columns count, but override for certain tables (like milan_day)
  const days = useMemo(() => {
    // Otherwise, try to compute based on column count
    if (columns.length === 17) {
      return ["Mon", "Tue", "Wed", "Thu", "Fri"];
    } else if (columns.length === 20) {
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    } else if (columns.length === 23) {
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    } else {
      // Fallback: default to 7 days if columns count doesn't match expected values.
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    }
  }, [columns, tableName]);

  useEffect(() => {
    if (tableName) {
      fetchRecords();
    }
    localStorage.setItem("selectedTable", tableName);
  }, [tableName]);

  const splitPana = (pana) => {
    if (!pana || pana === "None") return ["", "", ""];
    return pana === "***" ? ["*", "*", "*"] : pana.toString().split("");
  };

  const getJodiParts = (middleValue) => {
    if (!middleValue || middleValue === "None") {
      return { top: "", main: "", bottom: "" };
    }
    if (middleValue === "**") {
      return { top: "*", main: "**", bottom: "*" };
    }
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
    firstDigit = parseInt(firstDigit);
    secondDigit = parseInt(secondDigit);
    const difference =
      firstDigit > secondDigit
        ? Math.abs(secondDigit + 10 - firstDigit)
        : Math.abs(secondDigit - firstDigit);
    return (difference % 10).toString();
  };

  const fetchRecords = async () => {
    if (!tableName) {
      setError("Please select a table.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      const primaryKey = getPrimaryKey();
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .order(primaryKey, { ascending: false })
        .limit(5);
      if (error) throw error;
      const processedData = data ? data.reverse() : [];
      setRecords(processedData);
      // Store all column names from the first record (if available)
      setColumns(Object.keys(processedData[0] || {}));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRecord = async () => {
    try {
      const { data, error } = await supabase.from(tableName).insert([formData]);
      if (error) throw error;
      await fetchRecords();
      setFormData({});
      setSuccessMessage("Record added successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setFormData(record);
  };

  const handleUpdateRecord = async () => {
    try {
      const primaryKey = getPrimaryKey();
      const { data, error } = await supabase
        .from(tableName)
        .update(formData)
        .eq(primaryKey, editingRecord[primaryKey]);
      if (error) throw error;
      await fetchRecords();
      setEditingRecord(null);
      setFormData({});
      setSuccessMessage("Record updated successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    try {
      const primaryKey = getPrimaryKey();
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq(primaryKey, recordId);
      if (error) throw error;
      await fetchRecords();
      setSuccessMessage("Record deleted successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  // Render table using the original structure (Week Date Range + day-based columns)
  const renderTable = (records) => (
    <div className="w-full max-w-[480px] overflow-x-auto mx-auto md:overflow-x-visible">
      <div className="min-w-full">
        <table className="w-full border-collapse text-xs md:text-sm table-fixed">
          <thead>
            <tr className="bg-[#6D0B3E] text-white">
              <th className="border border-gray-300 w-12 md:w-16">Week</th>
              {days.map((day) => (
                <th key={day} className="border border-gray-300 w-12 md:w-14">
                  {day}
                </th>
              ))}
              <th className="border border-gray-300 w-20 md:w-24">Actions</th>
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
                          <div className="flex flex-col items-center w-3 md:w-4">
                            {splitPana(op).map((digit, idx) => (
                              <span
                                key={idx}
                                className="font-semibold text-black text-[8px] md:text-xs leading-none"
                              >
                                {digit}
                              </span>
                            ))}
                          </div>
                          <div className="flex flex-col items-center w-4 md:w-6">
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
                          <div className="flex flex-col items-center w-3 md:w-4">
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
                <td className="border border-gray-300 p-1">
                  <div className="flex justify-around space-x-3 md:space-x-3">
                    <button
                      onClick={() => handleEditRecord(record)}
                      className="text-blue-500 hover:underline text-[12px] md:text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteRecord(record[getPrimaryKey()])
                      }
                      className="text-red-500 hover:underline text-[12px] md:text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render add/edit form using the same old structure for day fields
  const renderForm = () => (
    <div className="mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Add/Edit Record
      </h2>
      <div className="flex flex-col space-y-4 mx-2 md:mx-auto md:max-w-2xl">
        <input
          name="Week Date Range"
          value={formData["Week Date Range"] || ""}
          onChange={handleInputChange}
          placeholder="Week Date Range"
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {days.map((day) => (
          <div key={day} className="flex space-x-2">
            <input
              name={`${day}_OP`}
              value={formData[`${day}_OP`] || ""}
              onChange={handleInputChange}
              placeholder={`${day} Opening Pana`}
              className="px-2 md:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-1/3 text-xs md:text-sm"
            />
            <input
              name={day}
              value={formData[day] || ""}
              onChange={handleInputChange}
              placeholder={`${day} Middle Number`}
              className="px-2 md:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-1/3 text-xs md:text-sm"
            />
            <input
              name={`${day}_CP`}
              value={formData[`${day}_CP`] || ""}
              onChange={handleInputChange}
              placeholder={`${day} Closing Pana`}
              className="px-2 md:px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-1/3 text-xs md:text-sm"
            />
          </div>
        ))}
        <div className="flex space-x-4">
          <button
            onClick={editingRecord ? handleUpdateRecord : handleAddRecord}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            {editingRecord ? "Update Record" : "Add Record"}
          </button>
          {editingRecord && (
            <button
              onClick={() => {
                setEditingRecord(null);
                setFormData({});
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-2 md:px-0 py-4">
      <div className="text-center mb-6">
        <h1 className="text-lg md:text-3xl font-semibold text-white py-1 bg-[#6D0B3E] rounded-md">
          Database Record Update
        </h1>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <select
          value={tableName}
          onChange={(e) => {
            setTableName(e.target.value);
            setFormData({});
            setEditingRecord(null);
            setRecords([]);
          }}
          className="w-full md:w-auto px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a Table</option>
          {tables.map((table) => (
            <option key={table} value={table}>
              {table}
            </option>
          ))}
        </select>
      </div>
      {loading && (
        <div className="text-center text-gray-600 py-4">Loading...</div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {successMessage}
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
      {records.length > 0 && renderForm()}
    </div>
  );
};

export default DatabaseUpdate;
