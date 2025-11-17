import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";
import { FaRegCalendarCheck, FaRegCalendarTimes, FaRupeeSign } from "react-icons/fa";
import { BiCalendar, BiCalendarEvent } from "react-icons/bi";
import { MdPendingActions } from "react-icons/md";
import BookingSummaryCard from "../../components/CommonUI/BookingSummaryCard";
import PerformanceTable, { PerformanceRowData } from "../../components/CommonUI/PerformanceTable";
import { API } from "../../api";

interface BookingOverviewResponse {
  error: boolean;
  message: string;
  data: {
    total: {
      totalBookingAmount: number;
      totalBookings: number;
    };
    thisMonth: {
      bookingsThisMonth: number;
      bookingsThisMonthAmount: number;
    };
    thisYear: {
      bookingsThisYear: number;
      bookingsThisYearAmount: number;
    };
    cancelBookings: {
      cancelBookings: number;
      cancelBookingAmount: number;
    };
    pendingAmount: number;
    pendingThisMonth: number;
    performanceOverview: {
      vertical: PerformanceData[];
      ad: PerformanceData[];
      vp: PerformanceData[];
      avp: PerformanceData[];
      gm: PerformanceData[];
      agm: PerformanceData[];
      tlcp: PerformanceData[];
      srportfoliomanager: PerformanceData[];
      portfoliomanager: PerformanceData[];
      asportfoliomanager: PerformanceData[];
      srbde: PerformanceData[];
      bde: PerformanceData[];
      employee: PerformanceData[];
    };
  };
}

interface PerformanceData {
  _id: string;
  name?: string;
  thisMonth: number;
  thisYear: number;
}

interface BookingMetrics {
  totalBooking: { count: number; value: string };
  bookingThisYear: { count: number; value: string };
  bookingThisMonth: { count: number; value: string };
  cancelledBooking: { count: number; value: string };
  pendingAmount: { count: number; value: string };
  currentMonthPending: { count: number; value: string };
  performanceOverview: {
    vertical: PerformanceRowData[];
    ad: PerformanceRowData[];
    vp: PerformanceRowData[];
    avp: PerformanceRowData[];
    gm: PerformanceRowData[];
    agm: PerformanceRowData[];
    tlcp: PerformanceRowData[];
    srPortfolioManager: PerformanceRowData[];
    portfolioManager: PerformanceRowData[];
    asPortfolioManager: PerformanceRowData[];
    srBDE: PerformanceRowData[];
    bde: PerformanceRowData[];
    employees: PerformanceRowData[];
  }
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return `₹ ${amount.toLocaleString('en-IN')}`;
};

// Transform API response to our component's format
const transformApiResponse = (data: BookingOverviewResponse['data']): BookingMetrics => {
  return {
    totalBooking: { 
      count: data.total.totalBookings, 
      value: formatCurrency(data.total.totalBookingAmount) 
    },
    bookingThisYear: { 
      count: data.thisYear.bookingsThisYear, 
      value: formatCurrency(data.thisYear.bookingsThisYearAmount) 
    },
    bookingThisMonth: { 
      count: data.thisMonth.bookingsThisMonth, 
      value: formatCurrency(data.thisMonth.bookingsThisMonthAmount) 
    },
    cancelledBooking: { 
      count: data.cancelBookings.cancelBookings, 
      value: formatCurrency(data.cancelBookings.cancelBookingAmount) 
    },
    pendingAmount: { 
      count: 0, // No count in the API response
      value: formatCurrency(data.pendingAmount) 
    },
    currentMonthPending: { 
      count: 0, // No count in the API response
      value: formatCurrency(data.pendingThisMonth) 
    },
    performanceOverview: {
      vertical: transformPerformanceData(data.performanceOverview.vertical),
      ad: transformPerformanceData(data.performanceOverview.ad),
      vp: transformPerformanceData(data.performanceOverview.vp),
      avp: transformPerformanceData(data.performanceOverview.avp),
      gm: transformPerformanceData(data.performanceOverview.gm),
      agm: transformPerformanceData(data.performanceOverview.agm),
      tlcp: transformPerformanceData(data.performanceOverview.tlcp),
      srPortfolioManager: transformPerformanceData(data.performanceOverview.srportfoliomanager),
      portfolioManager: transformPerformanceData(data.performanceOverview.portfoliomanager),
      asPortfolioManager: transformPerformanceData(data.performanceOverview.asportfoliomanager),
      srBDE: transformPerformanceData(data.performanceOverview.srbde),
      bde: transformPerformanceData(data.performanceOverview.bde),
      employees: transformPerformanceData(data.performanceOverview.employee)
    }
  };
};

// Helper function to transform performance data
const transformPerformanceData = (data: PerformanceData[]): PerformanceRowData[] => {
  if (!data) return [];
  return data.map(item => ({
    name: item.name || "",
    thisMonthValue: formatCurrency(item.thisMonth),
    thisYearValue: formatCurrency(item.thisYear)
  }));
};

// Mock data function kept for fallback or development purposes
const getMockBookingMetrics = (): BookingMetrics => {
  return {
    totalBooking: { count: 700, value: "₹ 50,00,000" },
    bookingThisYear: { count: 250, value: "₹ 10,00,000" },
    bookingThisMonth: { count: 20, value: "₹ 5,00,000" },
    cancelledBooking: { count: 7, value: "₹ 1,00,000" },
    pendingAmount: { count: 300, value: "₹ 90,00,000" },
    currentMonthPending: { count: 50, value: "₹ 70,00,000" },
    performanceOverview: {
      vertical: [
        { name: "Sharukh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amir", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amitabh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" }
      ],
      ad: [
        { name: "Sharukh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amir", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amitabh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" }
      ],
      vp: [
        { name: "Sharukh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amir", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amitabh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" }
      ],
      avp: [
        { name: "Sharukh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amir", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amitabh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" }
      ],
      gm: [
        { name: "Sharukh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amir", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amitabh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" }
      ],
      agm: [
        { name: "Sharukh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amir", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amitabh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" }
      ],
      tlcp: [
        { name: "Sharukh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amir", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amitabh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" }
      ],
      srPortfolioManager: [
        { name: "Sharukh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amir", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amitabh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" }
      ],
      portfolioManager: [
        { name: "Sharukh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amir", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amitabh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" }
      ],
      asPortfolioManager: [
        { name: "Sharukh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amir", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amitabh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" }
      ],
      srBDE: [
        { name: "Sharukh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amir", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amitabh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" }
      ],
      bde: [
        { name: "Sharukh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amir", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amitabh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" }
      ],
      employees: [
        { name: "Sharukh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amir", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" },
        { name: "Amitabh", thisMonthValue: "₹ 50,00,000", thisYearValue: "₹ 50,00,000" }
      ]
    }
  };
};

const BookingDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<BookingMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBookingMetrics = async () => {
    try {
      const response = await API.getAuthAPI("booking-overview", true);
      console.log(response);
      if (response.error) throw new Error(response.error);
      
      // Transform the API response to match our component's format
      const transformedData = transformApiResponse(response.data);
      setMetrics(transformedData);
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch booking metrics";
      toast.error(errorMessage);
      
      // Fallback to mock data in case of error
      console.log("error", error);
      
      setMetrics(getMockBookingMetrics());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingMetrics();
  }, []);

  if (loading) {
    return <MiniLoader />;
  }

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-12 gap-4 mb-8">
        <div className="col-span-12 sm:col-span-6 lg:col-span-4 ">
          <BookingSummaryCard 
            title="Total Booking" 
            value={metrics?.totalBooking.value || ""} 
            count={metrics?.totalBooking.count || 0}
            color="#4318FF"
            icon={<BiCalendarEvent className="text-2xl" />}
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-4 ">
          <BookingSummaryCard 
            title="Booking This Year" 
            value={metrics?.bookingThisYear.value || ""} 
            count={metrics?.bookingThisYear.count || 0}
            color="#05CD99"
            icon={<BiCalendar className="text-2xl" />}
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-4 ">
          <BookingSummaryCard 
            title="Booking this Month" 
            value={metrics?.bookingThisMonth.value || ""} 
            count={metrics?.bookingThisMonth.count || 0}
            color="#FFB547"
            icon={<FaRegCalendarCheck className="text-2xl" />}
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-4 ">
          <BookingSummaryCard 
            title="Cancel Booking" 
            value={metrics?.cancelledBooking.value || ""} 
            count={metrics?.cancelledBooking.count || 0}
            color="#EE5D50"
            icon={<FaRegCalendarTimes className="text-2xl" />}
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-4 ">
          <BookingSummaryCard 
            title="Pending Amount" 
            value={metrics?.pendingAmount.value || ""} 
            count={metrics?.pendingAmount.count || 0}
            color="#3E82F7"
            icon={<MdPendingActions className="text-2xl" />}
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-4 ">
          <BookingSummaryCard 
            title="Current Month Pending" 
            value={metrics?.currentMonthPending.value || ""} 
            count={metrics?.currentMonthPending.count || 0}
            color="#6C5DD3"
            icon={<FaRupeeSign className="text-2xl" />}
          />
        </div>
      </div>

      {/* Performance Overview Heading */}
      <div className="mb-5">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Performance Overview</h3>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-12 gap-5 mb-6">
        <div className="col-span-12 md:col-span-6">
          <PerformanceTable 
            title="Vertical" 
            data={metrics?.performanceOverview.vertical || []} 
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <PerformanceTable 
            title="AD" 
            data={metrics?.performanceOverview.ad || []} 
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 mb-6">
        <div className="col-span-12 md:col-span-6">
          <PerformanceTable 
            title="VP" 
            data={metrics?.performanceOverview.vp || []} 
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <PerformanceTable 
            title="AVP" 
            data={metrics?.performanceOverview.avp || []} 
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 mb-6">
        <div className="col-span-12 md:col-span-6">
          <PerformanceTable 
            title="GM" 
            data={metrics?.performanceOverview.gm || []} 
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <PerformanceTable 
            title="AGM" 
            data={metrics?.performanceOverview.agm || []} 
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 mb-6">
        <div className="col-span-12 md:col-span-6">
          <PerformanceTable 
            title="TL/CP" 
            data={metrics?.performanceOverview.tlcp || []} 
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <PerformanceTable 
            title="Sr. Portfolio Manager" 
            data={metrics?.performanceOverview.srPortfolioManager || []} 
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 mb-6">
        <div className="col-span-12 md:col-span-6">
          <PerformanceTable 
            title="Portfolio Manager" 
            data={metrics?.performanceOverview.portfolioManager || []} 
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <PerformanceTable 
            title="As. Portfolio Manager" 
            data={metrics?.performanceOverview.asPortfolioManager || []} 
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 mb-6">
        <div className="col-span-12 md:col-span-6">
          <PerformanceTable 
            title="Sr. BDE" 
            data={metrics?.performanceOverview.srBDE || []} 
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <PerformanceTable 
            title="BDE" 
            data={metrics?.performanceOverview.bde || []} 
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 mb-6">
        <div className="col-span-12 md:col-span-6">
          <PerformanceTable 
            title="Employees" 
            data={metrics?.performanceOverview.employees || []} 
          />
        </div>
      </div>
    </div>
  );
};

export default BookingDashboard; 