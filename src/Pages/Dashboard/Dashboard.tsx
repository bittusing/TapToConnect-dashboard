import { useEffect, useState } from "react";
import DefaultLayout from "../../layouts/DefaultLayout";
// import { islogined } from "../../utils/loginHandler";
import { Outlet } from "react-router-dom";
import UniversalLoader from "../../components/CommonUI/Loader";
import { fetchGeneralData } from "../../api/commonAPI";
import NotificationSetup from "../../components/Notification/NotificationSetup";
// import Footer from "../../components/common/footer/Footer";
// import Sidebar from "../../components/common/sidebar/Sidebar";
// import ResponsiveSidebar from "../../components/mobileUI/ResponsiveSidebar";
// import { Spin } from "antd";

export default function Dashboard() {
  //   const navigate = useNavigate();
  useEffect(() => {
    // fetchGeneralData();
  }, []);

  return (
    <>
      <DefaultLayout>
        {/* <NotificationSetup /> */}
        <Outlet />
      </DefaultLayout>
    </>
    // <div className="flex md:flex-row flex-col bg-softGrey h-screen">
    //   {/* Side Bar  */}
    //   <div className="md:flex hidden">
    //     <Sidebar />
    //   </div>
    //   <ResponsiveSidebar />

    //   {/* Main dashBoard  */}
    //   <div className="w-full overflow-auto flex flex-col md:shadow-md">
    //     <div
    //       className="md:block hidden w-full h-[64px] bg-white z-10"
    //       style={{ boxShadow: "0px 0px 4px 0px #999999" }}
    //     ></div>
    //     <div id="outletContainer" className="w-full  overflow-auto flex-1">
    //       <div className="md:pt-[50px] md:p-[26px] p-[16px] pt-[1px] md:pb-[74px] pb-[74px]">
    //         <Outlet />
    //       </div>
    //       <Footer />
    //     </div>
    //   </div>
    // </div>
  );
}
