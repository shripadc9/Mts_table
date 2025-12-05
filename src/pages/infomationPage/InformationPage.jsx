// src/pages/InformationPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";
import supabase from "../../supabase/supabaseClient";

// Helper function to transform various YouTube URL formats to an embed URL.
const transformYoutubeUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    let videoId = "";
    // Handle watch pages: e.g. https://www.youtube.com/watch?v=VIDEO_ID
    if (parsedUrl.pathname === "/watch") {
      videoId = parsedUrl.searchParams.get("v");
    }
    // Handle mobile URLs: e.g. https://m.youtube.com/watch?v=VIDEO_ID
    else if (
      parsedUrl.hostname.includes("m.youtube.com") &&
      parsedUrl.pathname === "/watch"
    ) {
      videoId = parsedUrl.searchParams.get("v");
    }
    // Handle shortened URLs: e.g. https://youtu.be/VIDEO_ID
    else if (parsedUrl.hostname === "youtu.be") {
      videoId = parsedUrl.pathname.slice(1);
    }
    // If we extracted a video ID, return the embed URL.
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Otherwise, return the original URL.
    return url;
  } catch (error) {
    console.error("Error parsing YouTube URL:", error);
    return url;
  }
};

// SWR fetcher function to retrieve information page data from Supabase.
const fetchInformationPageData = async () => {
  const { data, error } = await supabase
    .from("information_page")
    .select("youtube_video_link")
    .eq("id", 1)
    .single();
  if (error) throw error;
  return data;
};

const InformationPage = () => {
  // Use SWR to fetch the YouTube video link.
  const { data: infoData, error: infoError } = useSWR(
    "information_page",
    fetchInformationPageData,
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      dedupingInterval: 5 * 60 * 1000,
    }
  );

  // Transform the URL; fallback to a default video if none provided.
  const youtubeVideoLink = infoData
    ? transformYoutubeUrl(infoData.youtube_video_link)
    : "https://www.youtube.com/embed/dQw4w9WgXcQ";

  if (infoError) {
    console.error("Error fetching video link:", infoError);
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4 overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Section: Chart Pattern Finder Link */}
        <div className="bg-[#f8ffee] py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="p-4 sm:p-8 bg-white rounded-xl shadow-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                Click here to Find Matka Lines Patterns
              </h2>
              <Link
                to="/chart-pattern-finder"
                className="inline-block text-lg sm:text-xl md:text-4xl font-bold border-2 border-[#960b61] text-[#960b61] bg-[#d4ff32] hover:bg-[#fdff32] hover:text-[#1308a5] px-4 py-2 md:px-8 md:py-4 rounded-xl md:rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
              >
                Chart Pattern Finder
              </Link>
            </div>
          </div>
        </div>

        {/* About Our Website Section */}
        <section className="p-4 sm:p-6 border border-rose-700 rounded-lg shadow-sm bg-white">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center">
            About Our Website
          </h2>
          <div className="space-y-4 text-gray-700 text-sm sm:text-base">
            <p>
              Our website is your best resource for discovering Matka lines and
              patterns. You can enter any combination of values, such as any
              Jodi, the open and close numbers, total, and difference, into our
              table. Based on these inputs, our system will automatically
              generate and display the corresponding lines for all Matka charts.
            </p>
            <p>
              हमारी वेबसाइट Matka की लाइनों और पैटर्न खोजने के लिए सबसे उत्तम
              प्लेटफ़ॉर्म है। आप यहाँ किसी भी जोड़ी, ओपन और क्लोज नंबर, टोटल तथा
              डिफरेंस जैसी किसी भी वैल्यू को हमारे सॉफ़्टवेयर में दर्ज कर सकते
              हैं। आपके द्वारा दर्ज की गई जानकारी के आधार पर, हमारी प्रणाली
              स्वचालित रूप से सभी Matka चार्ट्स के लिए उपयुक्त लाइनों को तैयार
              कर देगी और प्रदर्शित करेगी।
            </p>
          </div>
        </section>

        {/* How to Use Our Software Section */}
        <section className="p-4 sm:p-6 border border-rose-700 rounded-lg shadow-sm bg-white">
          <h2 className="text-xl sm:text-2xl text-center font-bold text-gray-800 mb-5">
            How to Use Our Software
          </h2>
          <div className="text-gray-700 space-y-6 text-sm sm:text-base">
            {/* English Instructions */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                Standard Input Method for Our Software (follow the rules below)
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Jodi (Pair):</strong> Enter the two-digit number.{" "}
                  <strong>Example:</strong> <strong>55</strong>
                </li>
                <li>
                  <strong>Open Number Digit:</strong> Enter the digit first,
                  then add an asterisk (<strong>*</strong>) at the end.{" "}
                  <strong>Example:</strong> <strong>5*</strong>
                </li>
                <li>
                  <strong>Close Number Digit:</strong> Enter an asterisk (
                  <strong>*</strong>) first, then the digit.{" "}
                  <strong>Example:</strong> <strong>*5</strong>
                </li>
                <li>
                  <strong>Total:</strong> Enter the letter <strong>T</strong>{" "}
                  first, followed by the digit. <strong>Example:</strong>{" "}
                  <strong>T5</strong>
                </li>
                <li>
                  <strong>Difference:</strong> Enter the letter{" "}
                  <strong>D</strong> first, followed by the digit.{" "}
                  <strong>Example:</strong> <strong>D5</strong>
                </li>
              </ul>
            </div>
            {/* Hindi Instructions */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-2">
                हमारे सॉफ़्टवेयर इनपुट के लिए नीचे दिए गए नियमों का पालन करें:
              </h2>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>जोड़ी (Pair):</strong> दो अंकों की संख्या दर्ज करें।{" "}
                  <strong>उदाहरण:</strong> <strong>55</strong>
                </li>
                <li>
                  <strong>ओपन अंक (Open Number Digit):</strong> पहले अंक दर्ज
                  करें और अंत में <strong>*</strong> लगाएं।{" "}
                  <strong>उदाहरण:</strong> <strong>5*</strong>
                </li>
                <li>
                  <strong>क्लोज अंक (Close Number Digit):</strong> पहले{" "}
                  <strong>*</strong> लगाएं और फिर अंक दर्ज करें।{" "}
                  <strong>उदाहरण:</strong> <strong>*5</strong>
                </li>
                <li>
                  <strong>टोटल (Total):</strong> पहले अक्षर <strong>T</strong>{" "}
                  लिखें, फिर टोटल अंक। <strong>उदाहरण:</strong>{" "}
                  <strong>T5</strong>
                </li>
                <li>
                  <strong>डिफरेंस (Difference):</strong> पहले अक्षर{" "}
                  <strong>D</strong> लिखें, फिर डिफरेंस अंक।{" "}
                  <strong>उदाहरण:</strong> <strong>D5</strong>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* YouTube Video Section */}
        <section className="p-4 sm:p-6 border border-rose-700 rounded-lg shadow-sm bg-white">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center">
            How to Use our Pattern Finding Software - Please Watch Video
          </h2>
          <div className="flex justify-center">
            <iframe
              width="560"
              height="315"
              src={youtubeVideoLink}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg shadow-md"
            ></iframe>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InformationPage;
