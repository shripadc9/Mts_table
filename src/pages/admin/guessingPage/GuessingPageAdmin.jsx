// src/pages/GuessingPageAdmin.jsx
import { useState, useEffect } from "react";
import supabase from "../../../supabase/supabaseClient";

export default function GuessingPageAdmin() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Helper function to convert file to Base64
  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // Fetch all images from the "images" table
  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("images")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching images:", error);
    } else {
      setImages(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Upload new image and insert record into table
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file.");
      return;
    }
    setLoading(true);
    try {
      // Convert file to Base64 string
      const base64Data = await readFileAsBase64(file);

      // Insert record into the "images" table
      const { error } = await supabase.from("images").insert([
        {
          title,
          description,
          image_url: base64Data, // store Base64 data in image_url column
          likes: 0,
        },
      ]);
      if (error) throw error;

      alert("Image uploaded successfully!");
      // Reset form fields
      setTitle("");
      setDescription("");
      setFile(null);
      fetchImages();
    } catch (error) {
      console.error("Error uploading image:", error.message);
      alert("Error uploading image: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Enter edit mode for a record
  const handleEdit = (record) => {
    setEditId(record.id);
    setEditTitle(record.title);
    setEditDescription(record.description);
  };

  // Update the record in the "images" table
  const handleUpdate = async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("images")
        .update({ title: editTitle, description: editDescription })
        .eq("id", id);
      if (error) throw error;
      setEditId(null);
      fetchImages();
    } catch (error) {
      console.error("Error updating record:", error.message);
      alert("Error updating record: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h1>

      {/* Upload Form */}
      <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Image Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            placeholder="Image Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          ></textarea>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {loading ? "Uploading..." : "Upload Image"}
          </button>
        </form>
      </div>

      {/* Editable Images List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="text-center">Loading images...</div>
        ) : (
          images.map((img) => (
            <div key={img.id} className="bg-white rounded-lg shadow p-4">
              <img
                src={img.image_url}
                alt={img.title}
                className="w-full h-48 object-cover rounded mb-4"
              />
              {editId === img.id ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                  ></textarea>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdate(img.id)}
                      className="flex-1 bg-green-500 text-white p-2 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-500 text-white p-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold">{img.title}</h2>
                  <p className="text-gray-600 mb-2">{img.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Likes: {img.likes}</span>
                    <button
                      onClick={() => handleEdit(img)}
                      className="bg-blue-500 text-white p-2 rounded"
                    >
                      Edit
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
