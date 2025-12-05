import React, { useEffect, useState } from "react";
import supabase from "../../../supabase/supabaseClient";

const AdminSubscriptionPlan = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For inline editing
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedPlan, setEditedPlan] = useState({});

  // For adding a new plan
  const [newPlan, setNewPlan] = useState({
    plan_name: "",
    duration: "",
    price: "",
    description: "",
  });

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .order("id", { ascending: true });
    if (error) {
      setError(error.message);
    } else {
      setPlans(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const startEditing = (plan, index) => {
    setEditingIndex(index);
    setEditedPlan({ ...plan });
  };

  const handleEditChange = (field, value) => {
    setEditedPlan((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    const { error } = await supabase
      .from("subscription_plans")
      .update(editedPlan)
      .eq("id", plans[editingIndex].id);
    if (error) {
      alert("Update failed: " + error.message);
    } else {
      fetchPlans();
    }
    setEditingIndex(null);
  };

  const handleNewPlanChange = (field, value) => {
    setNewPlan((prev) => ({ ...prev, [field]: value }));
  };

  const addPlan = async () => {
    if (newPlan.plan_name && newPlan.duration && newPlan.price) {
      const { error } = await supabase
        .from("subscription_plans")
        .insert([newPlan]);
      if (error) {
        alert("Add new plan failed: " + error.message);
      } else {
        fetchPlans();
        setNewPlan({
          plan_name: "",
          duration: "",
          price: "",
          description: "",
        });
      }
    } else {
      alert("Plan Name, Duration, and Price are required.");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">
        Admin: Manage Subscription Plans
      </h1>

      {/* New Plan Form */}
      <div className="max-w-md mx-auto bg-white p-4 rounded shadow mb-8">
        <h2 className="text-xl font-semibold text-center mb-4">Add New Plan</h2>
        <input
          type="text"
          value={newPlan.plan_name}
          onChange={(e) => handleNewPlanChange("plan_name", e.target.value)}
          placeholder="Plan Name (e.g. 1 Month)"
          className="w-full mb-2 px-2 py-1 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <input
          type="text"
          value={newPlan.duration}
          onChange={(e) => handleNewPlanChange("duration", e.target.value)}
          placeholder="Duration (e.g. 1 Month, 3 Months)"
          className="w-full mb-2 px-2 py-1 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <input
          type="number"
          value={newPlan.price}
          onChange={(e) => handleNewPlanChange("price", e.target.value)}
          placeholder="Price"
          className="w-full mb-2 px-2 py-1 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <textarea
          value={newPlan.description}
          onChange={(e) => handleNewPlanChange("description", e.target.value)}
          placeholder="Description (optional)"
          className="w-full mb-4 px-2 py-1 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <button
          onClick={addPlan}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
        >
          Add Plan
        </button>
      </div>

      {/* Existing Plans List */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan, index) => (
          <div
            key={plan.id}
            className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow"
          >
            {editingIndex === index ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editedPlan.plan_name}
                  onChange={(e) =>
                    handleEditChange("plan_name", e.target.value)
                  }
                  placeholder="Plan Name"
                  className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring focus:border-blue-300"
                />
                <input
                  type="text"
                  value={editedPlan.duration}
                  onChange={(e) => handleEditChange("duration", e.target.value)}
                  placeholder="Duration"
                  className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring focus:border-blue-300"
                />
                <input
                  type="number"
                  value={editedPlan.price}
                  onChange={(e) => handleEditChange("price", e.target.value)}
                  placeholder="Price"
                  className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring focus:border-blue-300"
                />
                <textarea
                  value={editedPlan.description || ""}
                  onChange={(e) =>
                    handleEditChange("description", e.target.value)
                  }
                  placeholder="Description (optional)"
                  className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring focus:border-blue-300"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingIndex(null)}
                    className="w-full bg-gray-300 text-sm py-1 rounded hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="w-full bg-blue-600 text-white text-sm py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <h2 className="text-xl font-bold">{plan.plan_name}</h2>
                <p className="text-gray-700">Duration: {plan.duration}</p>
                <p className="text-gray-900 font-semibold">
                  Price: Rs {plan.price}
                </p>
                {plan.description && (
                  <p className="text-gray-500 text-sm">{plan.description}</p>
                )}
                <div className="mt-2">
                  <button
                    onClick={() => {
                      setEditingIndex(index);
                      setEditedPlan({ ...plan });
                    }}
                    className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSubscriptionPlan;
