import React, { useState, useEffect } from "react";
import supabase from "../../../supabase/supabaseClient";

function AdminPaymentDetail() {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    instructions: "",
    contact_button_text: "Contact Us",
    image_url: "", // Will store the image data as a Data URL (Base64 encoded)
    url_id: "",
  });
  const [recordId, setRecordId] = useState(null);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    async function fetchDetails() {
      // Try to fetch an existing record
      const { data, error } = await supabase
        .from("payment_details")
        .select("*")
        .limit(1)
        .single();
      if (!error && data) {
        setFormData({
          title: data.title,
          subtitle: data.subtitle,
          instructions: data.instructions,
          contact_button_text: data.contact_button_text,
          image_url: data.image_url || "",
          url_id: data.url_id || "",
        });
        setRecordId(data.id);
      } else {
        console.error("Fetch error:", error);
      }
    }
    fetchDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Read the file as a Data URL (Base64 encoded) and update formData.image_url
  const handleUpload = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result is the Data URL string (e.g., "data:image/png;base64,...")
      setFormData((prev) => ({
        ...prev,
        image_url: reader.result,
        url_id: "", // Optionally, set or clear a file identifier
      }));
      setMessage("Image loaded successfully!");
    };
    reader.onerror = () => {
      setMessage("Failed to read the image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;
    if (recordId) {
      // If record exists, update it.
      result = await supabase
        .from("payment_details")
        .update({ ...formData })
        .eq("id", recordId);
    } else {
      // If no record exists, insert a new one.
      result = await supabase
        .from("payment_details")
        .insert({ ...formData })
        .select(); // Get the inserted record back
      if (result.data && result.data.length > 0) {
        setRecordId(result.data[0].id);
      }
    }
    if (result.error) {
      setMessage("Failed to update payment details: " + result.error.message);
    } else {
      setMessage("Payment details updated successfully!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-4">Update Payment Details</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Subtitle</label>
          <input
            type="text"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Instructions</label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="3"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Contact Button Text</label>
          <input
            type="text"
            name="contact_button_text"
            value={formData.contact_button_text}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        {/* File Upload Section */}
        <div className="mb-4">
          <label className="block text-gray-700">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
          <button
            type="button"
            onClick={handleUpload}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Load Image
          </button>
        </div>
        {/* Preview the loaded image */}
        {formData.image_url && (
          <div className="mb-4">
            <label className="block text-gray-700">Image Preview</label>
            <img
              src={formData.image_url}
              alt="Uploaded"
              className="w-48 h-48 object-cover"
            />
          </div>
        )}
        <div className="mb-4">
          <label className="block text-gray-700">UPI ID</label>
          <input
            type="text"
            name="url_id"
            value={formData.url_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {recordId ? "Update" : "Create"}
        </button>
        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </div>
  );
}

export default AdminPaymentDetail;
