import React, { useEffect, useState } from "react";
import supabase from "../../../supabase/supabaseClient";

const AdminContactPage = () => {
  const [contact, setContact] = useState({
    email: "",
    phone: "",
    whatsapp: "",
    youtube: "",
    instagram: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch existing contact details
  useEffect(() => {
    async function fetchContact() {
      const { data, error } = await supabase
        .from("contact_details")
        .select("*")
        .limit(1)
        .single();
      if (error) {
        setMessage("Error fetching contact details: " + error.message);
      } else if (data) {
        setContact(data);
      }
      setLoading(false);
    }
    fetchContact();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContact((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    // Assumes there's only one row in contact_details table
    const { error } = await supabase
      .from("contact_details")
      .update(contact)
      .eq("id", contact.id);
    if (error) {
      setMessage("Update failed: " + error.message);
    } else {
      setMessage("Contact details updated successfully!");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Admin: Update Contact Details
        </h1>
        {message && (
          <p className="mb-4 text-center text-green-600 font-semibold">
            {message}
          </p>
        )}
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block font-semibold text-gray-700">Email:</label>
            <input
              type="email"
              name="email"
              value={contact.email}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700">Phone:</label>
            <input
              type="text"
              name="phone"
              value={contact.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700">
              Whatsapp:
            </label>
            <input
              type="text"
              name="whatsapp"
              value={contact.whatsapp}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700">
              Youtube:
            </label>
            <input
              type="text"
              name="youtube"
              value={contact.youtube}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700">
              Instagram:
            </label>
            <input
              type="text"
              name="instagram"
              value={contact.instagram}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#6E8E59] hover:bg-green-700 text-white font-semibold py-2 rounded-full transition-colors"
          >
            Update Contact Details
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminContactPage;
