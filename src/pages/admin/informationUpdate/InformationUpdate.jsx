// AdminUpdateVideo.jsx
import React, { useState, useEffect } from "react";
import supabase from "../../../supabase/supabaseClient";

const AdminInformationUpdate = () => {
  const [videoLink, setVideoLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  // Fetch the current video link on mount
  useEffect(() => {
    async function fetchVideoLink() {
      const { data, error } = await supabase
        .from("information")
        .select("youtube_video_link")
        .eq("id", 1)
        .single();
      if (error) {
        console.error("Error fetching video link:", error);
      } else {
        setVideoLink(data.youtube_video_link);
      }
    }
    fetchVideoLink();
  }, []);

  // Update the video link in Supabase
  async function updateVideoLink() {
    setLoading(true);
    setUpdateMessage(""); // Clear any previous message
    const { error } = await supabase
      .from("information_page") // Change this to "information" if that’s the correct table name
      .update({ youtube_video_link: videoLink })
      .eq("id", 1);
    setLoading(false);
    if (error) {
      console.error("Error updating video link:", error);
      setUpdateMessage("Error updating video link.");
    } else {
      setUpdateMessage("Video link updated successfully!");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Admin: Update YouTube Video Link
        </h2>
        <label className="block mb-2 text-gray-700">YouTube Video Link</label>
        <input
          type="text"
          value={videoLink}
          onChange={(e) => setVideoLink(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          placeholder="Enter YouTube embed link"
        />
        <button
          onClick={updateVideoLink}
          className="w-full bg-[#74a110] text-white py-2 rounded-md hover:bg-[#556b26] transition duration-200"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Video Link"}
        </button>
        {updateMessage && (
          <p className="mt-4 text-center text-green-600">{updateMessage}</p>
        )}
      </div>
    </div>
  );
};

export default AdminInformationUpdate;
