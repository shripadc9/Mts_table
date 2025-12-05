import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import supabase from "../../supabase/supabaseClient";
import Skeleton from "@mui/material/Skeleton"; // Import MUI Skeleton

function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;
    setLikes(likes + 1); // Optimistic update
    setLoading(true);
    const { error } = await supabase
      .from("images")
      .update({ likes: likes + 1 })
      .eq("id", postId);
    if (error) {
      console.error("Error liking:", error);
      setLikes(likes); // Revert if error occurs
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleLike}
      className="flex items-center space-x-2 text-red-500 hover:text-red-600"
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      <span>{likes}</span>
    </button>
  );
}

export default function GalleryPage() {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    const { data, error } = await supabase
      .from("images")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("Error fetching posts:", error);
    else setPosts(data);
    setLoadingPosts(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Updated share function using current page URL
  const sharePost = async (post) => {
    const currentUrl = window.location.href; // Use current page link
    const shareData = {
      title: post.title,
      text: `${
        post.description || "Check out this image!"
      } Visit the guessing page at ${currentUrl}`,
      url: currentUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log("Content shared successfully");
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(currentUrl);
        alert("Current page link copied to clipboard!");
      } catch (err) {
        alert("Failed to copy link.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#ffbe8c]">
      {/* Header */}
      <header className="bg-[#EF9651] shadow-md text-center">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold text-white">
            Weekly Top Guessing Tricks
          </h1>
          <p className="text-white mt-1 text-sm">
            Enjoy the best Tricks and share them with your friends!
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 grid gap-4">
        {loadingPosts ? (
          // Skeleton loaders for better engagement during loading
          <div className="grid gap-4">
            {Array.from(new Array(3)).map((_, index) => (
              <article
                key={index}
                className="bg-white shadow overflow-hidden p-4"
              >
                <Skeleton variant="text" width="60%" height={30} />
                <Skeleton
                  variant="text"
                  width="80%"
                  height={20}
                  style={{ marginTop: 6 }}
                />
                <Skeleton
                  variant="text"
                  width="40%"
                  height={16}
                  style={{ marginTop: 6 }}
                />
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={150}
                  style={{ marginTop: 12 }}
                />
                <div className="flex justify-between items-center mt-4">
                  <Skeleton variant="text" width="20%" height={30} />
                  <Skeleton variant="text" width="20%" height={30} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="bg-white shadow overflow-hidden">
              {/* Post Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center p-4 border-b">
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-800">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-sm">{post.description}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(post.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              {/* Image */}
              <div
                className="relative cursor-zoom-in"
                onClick={() => {
                  setSelectedImage(post.image_url);
                  setZoom(1);
                  setRotation(0);
                }}
              >
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-60 object-cover transition-transform duration-200 hover:scale-105"
                />
              </div>
              <div className="text-center mt-2">
                <p className="text-xs">
                  Click on the Post for View the Trick Image
                </p>
              </div>

              {/* Post Footer with Like and Share Button */}
              <div className="p-4 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                <LikeButton postId={post.id} initialLikes={post.likes} />

                <button
                  onClick={() => sharePost(post)}
                  className="bg-blue-500 text-white rounded px-3 py-1 text-sm hover:bg-blue-600"
                >
                  Share
                </button>
              </div>
            </article>
          ))
        )}
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-[#ffbe8c] flex flex-col safe-area-inset">
          {/* Image Area: fills available space */}
          <div className="flex-1 flex items-center justify-center overflow-auto px-4 py-2">
            <img
              src={selectedImage}
              alt="Full view"
              className="max-w-full max-h-full object-contain transition-transform duration-300"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            />
          </div>

          {/* Control Panel: Responsive and Flexible for iOS */}
          <div className="bg-gray-900 p-4 w-full safe-area-inset-bottom">
            <div className="max-w-xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
                className={`w-full p-3 bg-gray-800 rounded text-white hover:bg-gray-700 text-sm ${
                  zoom <= 0.5 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={zoom <= 0.5}
              >
                Zoom Out
              </button>
              <button
                onClick={() => setZoom(Math.min(3, zoom + 0.2))}
                className={`w-full p-3 bg-gray-800 rounded text-white hover:bg-gray-700 text-sm ${
                  zoom >= 3 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={zoom >= 3}
              >
                Zoom In
              </button>
              <button
                onClick={() => setRotation(rotation + 90)}
                className="w-full p-3 bg-gray-800 rounded text-white hover:bg-gray-700 text-sm"
              >
                Rotate
              </button>
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setZoom(1);
                  setRotation(0);
                }}
                className="w-full p-3 bg-red-600 rounded text-white hover:bg-red-700 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
