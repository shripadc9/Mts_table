import React from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";
import supabase from "../../supabase/supabaseClient";

// Fetcher functions for SWR
const fetchSubscriptionPlans = async () => {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw error;
  return data;
};

const fetchPaymentDetail = async () => {
  const { data, error } = await supabase
    .from("payment_details")
    .select("*")
    .limit(1)
    .single();
  if (error) throw error;
  return data;
};

const PaymentSubscriptionPlan = () => {
  const { data: plans, error } = useSWR(
    "subscription_plans",
    fetchSubscriptionPlans,
    {
      refreshInterval: 2 * 60 * 60 * 1000, // auto-refresh every 5 minutes
      dedupingInterval: 2 * 60 * 60 * 1000, // prevent duplicate requests within 5 minutes
    }
  );

  if (!plans)
    return <div className="text-center">Loading Subscription Plans...</div>;
  if (error) return <div className="text-center">Error: {error.message}</div>;

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-center mb-4">
        Subscription Plans
      </h1>
      {plans.map((plan) => (
        <p key={plan.id} className="mb-2 text-lg text-gray-800 text-center">
          <span className="font-bold">{plan.plan_name}:</span> {plan.duration} |{" "}
          <span className="font-bold">Price:</span> Rs. {plan.price}
        </p>
      ))}
    </div>
  );
};

const PaymentDetail = () => {
  const { data: paymentDetails, error } = useSWR(
    "payment_details",
    fetchPaymentDetail,
    {
      refreshInterval: 10 * 60 * 1000, // refresh every 10 minutes
      dedupingInterval: 10 * 60 * 1000,
    }
  );

  const handleCopy = () => {
    if (paymentDetails?.url_id) {
      navigator.clipboard.writeText(paymentDetails.url_id);
      alert("UPI ID copied to clipboard!");
    }
  };

  if (!paymentDetails)
    return <div className="text-center">Loading Payment Details...</div>;
  if (error)
    return (
      <div className="text-center">
        Error: {error.message || "No payment details found"}
      </div>
    );

  return (
    <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-6 max-w-md w-full mx-auto my-8">
      <h1 className="text-xl md:text-2xl font-bold text-black text-center mb-2">
        {paymentDetails.title}
      </h1>
      <p className="text-gray-600 text-center mb-2 text-lg">
        {paymentDetails.subtitle}
      </p>
      <div className="flex flex-col items-center my-6">
        {paymentDetails.image_url ? (
          <img
            src={paymentDetails.image_url}
            alt="QR Code for Payment"
            className="w-64 h-64 object-cover"
          />
        ) : (
          <p>No QR code available</p>
        )}
        {paymentDetails.url_id && (
          <div className="flex items-center justify-center mt-6 mb-4">
            <span className="mr-2 font-mono text-lg">
              {paymentDetails.url_id}
            </span>
            <button
              onClick={handleCopy}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Copy UPI ID
            </button>
          </div>
        )}
      </div>
      <p className="text-rose-500 font-bold text-lg text-center mb-4">
        {paymentDetails.instructions}
      </p>
      <p className="text-green-600 font-bold text-md text-center mb-4">
        It takes 12 hours to update the payment details.
      </p>
      <div className="flex justify-center">
        <button className="bg-rose-600 text-white font-semibold text-lg px-6 py-2 rounded-lg hover:bg-rose-700">
          <Link to="/contact" className="text-white font-semibold text-lg">
            {paymentDetails.contact_button_text}
          </Link>
        </button>
      </div>
    </div>
  );
};

const PaymentPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#73C7C7] to-blue-200 flex flex-col items-center px-4 py-8">
      <PaymentSubscriptionPlan />
      <PaymentDetail />
    </div>
  );
};

export default PaymentPage;
