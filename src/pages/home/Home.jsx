import React, { useContext } from "react";
import Layout from "../../components/layout/Layout";
import { useDispatch, useSelector } from "react-redux";
import LiveMatkaResult from "../resultChart/LiveMatkaResult";
import InformationPage from "../infomationPage/InformationPage";
import Dashboard from "../admin/loginDashboard/LoginDashoard";
import ResetPassword from "../registration/ResetPassword";
import ContactPage from "../contactUs/ContactUs";
import PaymentSubscriptionPlan from "../payment/SubscriptionPlan";
import ExtraTable from "../patternInput/ExtraTable";

function Home() {
  const dispatch = useDispatch();
  const cartItem = useSelector((state) => state.cart);

  console.log(cartItem);

  return (
    <Layout>
      <div className="flex gap-5 justify-center"></div>
      <LiveMatkaResult />
      <InformationPage />
      <PaymentSubscriptionPlan />
      <ContactPage />
      <ExtraTable />
    </Layout>
  );
}

export default Home;
