import React from "react";
import supabase from "../../supabase/supabaseClient";
import useSWR from "swr";
import contactUs from "./contact-us.jpg";
import {
  FaEnvelope,
  FaPhone,
  FaWhatsapp,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";

// Fetcher function for contact details from Supabase
const fetchContact = async () => {
  const { data, error } = await supabase
    .from("contact_details")
    .select("*")
    .limit(1)
    .single();
  if (error) throw error;
  return data;
};

const ContactPage = () => {
  // Using SWR for data fetching with caching and deduplication
  const { data: contact, error } = useSWR("contact_details", fetchContact, {
    refreshInterval: 2 * 60 * 1000, // Increase refresh to every 15 minutes if data rarely changes
    dedupingInterval: 2 * 60 * 1000, // Prevent duplicate requests within this interval
  });

  if (!contact && !error) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-700">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        Error: {error.message}
      </div>
    );
  }

  const contactDetails = [
    {
      label: "Email",
      href: `mailto:${contact.email}`,
      value: contact.email,
      Icon: FaEnvelope,
      ariaLabel: "Send email",
    },
    {
      label: "Phone",
      href: `tel:${contact.phone}`,
      value: contact.phone,
      Icon: FaPhone,
      ariaLabel: "Call us",
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/${contact.whatsapp}`,
      value: contact.whatsapp,
      Icon: FaWhatsapp,
      ariaLabel: "Contact on WhatsApp",
    },
    {
      label: "YouTube",
      href: contact.youtube,
      value: "YouTube Channel",
      Icon: FaYoutube,
      ariaLabel: "Visit our YouTube channel",
    },
    {
      label: "Instagram",
      href: contact.instagram,
      value: "Instagram Profile",
      Icon: FaInstagram,
      ariaLabel: "Visit our Instagram profile",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-[#91f0f0] to-blue-200 py-4">
      <header className="py-4 text-center">
        <h1 className="text-4xl font-bold text-[#fa1b66]">Contact Us</h1>
        <p className="mt-1 text-base text-[#dd1558]">
          Contact us for any queries or support.
        </p>
      </header>

      <main className="container mx-auto px-2 py-10">
        <div className="bg-white rounded-lg shadow-lg p-10 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="flex flex-col space-y-4">
              {contactDetails.map((item, index) => {
                const IconComponent = item.Icon;
                return (
                  <div
                    key={index}
                    className="flex items-center hover:scale-105 transition duration-300"
                  >
                    <IconComponent
                      className="text-[#e7165c] mr-3 text-2xl"
                      aria-hidden="true"
                    />
                    <div>
                      <span className="block text-gray-800 font-semibold text-lg">
                        {item.label}
                      </span>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#e7165c] hover:underline text-base"
                        aria-label={item.ariaLabel}
                      >
                        {item.value}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center">
              <img
                src={contactUs}
                alt="Contact us illustration"
                className="rounded-lg shadow-md w-full h-auto"
                loading="lazy" // Lazy-load the image
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;
