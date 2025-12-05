import React from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";
import supabase from "../../supabase/supabaseClient";

// SWR fetcher function for subscription plans
const fetchSubscriptionPlans = async () => {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw error;
  return data;
};

const PaymentSubscriptionPlan = () => {
  // Using SWR for data fetching with auto-refresh and deduplication
  const { data: plans, error } = useSWR(
    "subscription_plans",
    fetchSubscriptionPlans,
    {
      refreshInterval: 5 * 60 * 1000, // auto-refresh every 5 minutes
      dedupingInterval: 5 * 60 * 1000, // prevents duplicate requests within 5 minutes
    }
  );

  if (!plans)
    return (
      <div className="flex items-center justify-center h-64 text-gray-800">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        Error: {error.message}
      </div>
    );

  return (
    <div className="py-8 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-6 text-[#e7165c]">
          Subscription Plans
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-gradient-to-br from-[#91f0f0] to-blue-100 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4"
            >
              <h2 className="text-xl font-bold text-[#c913da] mb-1">
                {plan.plan_name}
              </h2>
              <p className="text-sm text-[#03426d] mb-1">{plan.duration}</p>
              <p className="text-lg font-bold text-[#03426d] mb-2">
                Rs. {plan.price}
              </p>
              {plan.description && (
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {plan.description}
                </p>
              )}
              <Link to="/payment">
                <button className="w-full bg-[#03426d] hover:bg-[#036cb3] text-white font-semibold py-1.5 rounded-full text-sm transition-colors">
                  Payment
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentSubscriptionPlan;
