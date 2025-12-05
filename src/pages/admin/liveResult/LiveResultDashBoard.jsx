import React, { useEffect, useState } from "react";
import supabase from "../../../supabase/supabaseClient";

const AdminMatkaDashboard = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For inline editing
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedItem, setEditedItem] = useState({});

  // For adding new records
  const [newItem, setNewItem] = useState({
    title: "",
    result: "",
    time: "",
    color: "",
    jodiLink: "",
    panelLink: "",
  });

  // Fetch results from Supabase
  const fetchResults = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("matka_results")
      .select("*")
      .order("id", { ascending: true });
    if (error) {
      setError(error.message);
    } else {
      setResults(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Start editing a record
  const startEditing = (item, index) => {
    setEditingIndex(index);
    setEditedItem({ ...item });
  };

  // Update edited item in state
  const handleEditChange = (field, value) => {
    setEditedItem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save changes to Supabase for the editing record
  const saveEdit = async () => {
    const { error } = await supabase
      .from("matka_results")
      .update(editedItem)
      .eq("id", results[editingIndex].id);
    if (error) {
      alert("Update failed: " + error.message);
    } else {
      fetchResults();
    }
    setEditingIndex(null);
  };

  // Handle changes for new item
  const handleNewItemChange = (field, value) => {
    setNewItem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add a new record to Supabase
  const addItem = async () => {
    // Title, result, and time are required
    if (newItem.title && newItem.result && newItem.time) {
      const { error } = await supabase.from("matka_results").insert([newItem]);
      if (error) {
        alert("Add new result failed: " + error.message);
      } else {
        fetchResults();
        setNewItem({
          title: "",
          result: "",
          time: "",
          color: "",
          jodiLink: "",
          panelLink: "",
        });
      }
    } else {
      alert("Title, Result, and Time are required.");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4">Error: {error}</div>;

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Dashboard Header */}
      <div className="w-full bg-[#6D0B3E] text-white p-2 mb-6 rounded shadow">
        <h1 className="text-2xl font-bold text-center">Results Dashboard</h1>
      </div>

      {/* Add New Result Card */}
      <div className="max-w-md mx-auto bg-white p-3 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-3 text-center">
          Add New Result
        </h2>
        <div className="grid grid-cols-1 gap-3">
          <input
            type="text"
            value={newItem.title}
            onChange={(e) => handleNewItemChange("title", e.target.value)}
            placeholder="Game Title"
            className="px-2 py-1 border rounded text-sm text-center focus:outline-none focus:ring focus:border-blue-300"
          />
          <input
            type="text"
            value={newItem.result}
            onChange={(e) => handleNewItemChange("result", e.target.value)}
            placeholder="Result"
            className="px-2 py-1 border rounded text-sm text-center focus:outline-none focus:ring focus:border-blue-300"
          />
          <input
            type="text"
            value={newItem.time}
            onChange={(e) => handleNewItemChange("time", e.target.value)}
            placeholder="Time"
            className="px-2 py-1 border rounded text-sm text-center focus:outline-none focus:ring focus:border-blue-300"
          />
          <input
            type="text"
            value={newItem.color}
            onChange={(e) => handleNewItemChange("color", e.target.value)}
            placeholder="Color (optional)"
            className="px-2 py-1 border rounded text-sm text-center focus:outline-none focus:ring focus:border-blue-300"
          />
          <input
            type="text"
            value={newItem.jodiLink}
            onChange={(e) => handleNewItemChange("jodiLink", e.target.value)}
            placeholder="Jodi Link (optional)"
            className="px-2 py-1 border rounded text-sm text-center focus:outline-none focus:ring focus:border-blue-300"
          />
          <input
            type="text"
            value={newItem.panelLink}
            onChange={(e) => handleNewItemChange("panelLink", e.target.value)}
            placeholder="Panel Link (optional)"
            className="px-2 py-1 border rounded text-sm text-center focus:outline-none focus:ring focus:border-blue-300"
          />
          <button
            onClick={addItem}
            className="bg-[#6D0B3E] text-white py-1 rounded text-sm hover:bg-green-600 transition-colors"
          >
            Add Result
          </button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 px-2">
        {results.map((item, index) => (
          <div
            key={item.id}
            className="bg-white border rounded p-2 flex flex-col justify-center items-center text-center shadow hover:shadow-md transition-shadow"
          >
            {editingIndex === index ? (
              <div className="space-y-2 w-full">
                <input
                  type="text"
                  value={editedItem.title}
                  onChange={(e) => handleEditChange("title", e.target.value)}
                  placeholder="Game Title"
                  className="w-full px-2 py-1 border rounded text-xs text-center focus:outline-none focus:ring focus:border-blue-300"
                />
                <input
                  type="text"
                  value={editedItem.result}
                  onChange={(e) => handleEditChange("result", e.target.value)}
                  placeholder="Result"
                  className="w-full px-2 py-1 border rounded text-xs text-center focus:outline-none focus:ring focus:border-blue-300"
                />
                <input
                  type="text"
                  value={editedItem.time}
                  onChange={(e) => handleEditChange("time", e.target.value)}
                  placeholder="Time"
                  className="w-full px-2 py-1 border rounded text-xs text-center focus:outline-none focus:ring focus:border-blue-300"
                />
                <input
                  type="text"
                  value={editedItem.color || ""}
                  onChange={(e) => handleEditChange("color", e.target.value)}
                  placeholder="Color"
                  className="w-full px-2 py-1 border rounded text-xs text-center focus:outline-none focus:ring focus:border-blue-300"
                />
                <input
                  type="text"
                  value={editedItem.jodiLink || ""}
                  onChange={(e) => handleEditChange("jodiLink", e.target.value)}
                  placeholder="Jodi Link"
                  className="w-full px-2 py-1 border rounded text-xs text-center focus:outline-none focus:ring focus:border-blue-300"
                />
                <input
                  type="text"
                  value={editedItem.panelLink || ""}
                  onChange={(e) =>
                    handleEditChange("panelLink", e.target.value)
                  }
                  placeholder="Panel Link"
                  className="w-full px-2 py-1 border rounded text-xs text-center focus:outline-none focus:ring focus:border-blue-300"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingIndex(null)}
                    className="w-full bg-gray-200 text-xs py-1 rounded hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="w-full bg-green-500 text-white text-xs py-1 rounded hover:bg-green-600 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-grow flex flex-col justify-center">
                  <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                  <p className="font-semibold text-sm mb-1">{item.result}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                  {item.color && (
                    <p className={`text-xs font-bold text-${item.color}-700`}>
                      {item.color}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => startEditing(item, index)}
                  className="text-blue-500 text-xs bg-blue-50 px-2 py-1 rounded mt-2 hover:bg-blue-100 transition-colors"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminMatkaDashboard;
