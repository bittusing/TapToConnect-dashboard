import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";
import CustomAntdTable from "../../components/Tables/CustomAntdTable";
import SearchForm from "../../components/Header/SearchForm";
import BookingAdvanceFilterUI from "./BookingAdvanceFilterUI";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import { API } from "../../api";

interface NextDueAmount {
  amount: number;
  date: string;
  status: string;
  mode: string;
  transctionNo: string;
}

interface BookingData {
  key: string;
  _id: string;
  projectName: string;
  customer: string;
  email: string;
  contactName: string;
  bookingDate: string;
  BookingAmount: number;
  DuePayement: number;
  nextdueamount: NextDueAmount;
}

interface BookingFilters {
  status?: string;
  vertical?: string;
  as?: string;
  vp?: string;
  avp?: string;
  gm?: string;
  agm?: string;
  tlcp?: string;
  employee?: string;
  startDate?: string;
  endDate?: string;
}

interface PaginatedResponse {
  docs: BookingData[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

const UpcomingPayments: React.FC = () => {
  // State for table data
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isAdvanceFilterOpen, setIsAdvanceFilterOpen] = useState(false);
  const navigate = useNavigate();

  // State for filters
  const [advancedFilters, setAdvancedFilters] = useState<BookingFilters>({});

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Table columns
  const columns = [
    {
      title: "Name",
      dataIndex: "customer",
      key: "name",
    },
    {
      title: "Contact Name",
      dataIndex: "contactName",
      key: "contactName",
    },
    {
      title: "Booking Amount",
      dataIndex: "BookingAmount",
      key: "bookingAmount",
      render: (amount: number) => `₹${amount.toLocaleString("en-IN")}`,
    },
    {
      title: "Due Payment",
      dataIndex: "DuePayement",
      key: "duePayment",
      render: (amount: number) => `₹${amount.toLocaleString("en-IN")}`,
    },
    {
      title: "Next Due Date",
      dataIndex: "nextdueamount",
      key: "nextDueDate",
      render: (nextdue: NextDueAmount) => 
        nextdue ? new Date(nextdue.date).toLocaleDateString() : "N/A",
    },
    {
      title: "Booking Date",
      dataIndex: "bookingDate",
      key: "bookingDate",
      render: (bookingDate: string) => 
        bookingDate ? new Date(bookingDate).toLocaleDateString() : "N/A",
    },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: () => (
    //     <Button
    //       onClick={(e) => {
    //         e.stopPropagation();
    //       }}
    //       className="bg-primary text-white hover:bg-primary/90"
    //     >
    //       Quick Edit
    //     </Button>
    //   ),
    // },
  ];

  // Function to fetch bookings from API
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      // Construct API parameters
      const params: {
        page: number;
        limit: number;
        search?: string;
        employee?: string;
        tlcp?: string;
        avp?: string;
        vp?: string;
        as?: string;
        agm?: string;
        gm?: string;
        vertical?: string;
        startDate?: string;
        endDate?: string;
      } = {
        page: pagination.current,
        limit: pagination.pageSize,
      };

      // Add search parameter if it exists
      if (searchText) {
        params.search = searchText;
      }

      // Add advanced filters if they exist
      if (advancedFilters.employee) params.employee = advancedFilters.employee;
      if (advancedFilters.tlcp) params.tlcp = advancedFilters.tlcp;
      if (advancedFilters.avp) params.avp = advancedFilters.avp;
      if (advancedFilters.vp) params.vp = advancedFilters.vp;
      if (advancedFilters.as) params.as = advancedFilters.as;
      if (advancedFilters.agm) params.agm = advancedFilters.agm;
      if (advancedFilters.gm) params.gm = advancedFilters.gm;
      if (advancedFilters.vertical) params.vertical = advancedFilters.vertical;
      if (advancedFilters.startDate) params.startDate = advancedFilters.startDate;
      if (advancedFilters.endDate) params.endDate = advancedFilters.endDate;

      // Call the API
      const { data, error } = await API.getAuthAPI<PaginatedResponse>(
        "get-upcomming-booking", 
        true,
        params
      );

      if (error) {
        throw new Error(error);
      }

      // Process and set the data
      if (data && data.docs) {
        const formattedBookings = data.docs.map((booking: BookingData) => ({
          ...booking,
          key: booking._id,
        }));
        
        setBookings(formattedBookings);
        setPagination({
          ...pagination,
          total: data.totalDocs || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching upcoming payments:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, advancedFilters]);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchText(value);
        setPagination(prev => ({ ...prev, current: 1 }));
      }, 0),
    []
  );

  const handleSearch = (value: string) => {
    debouncedSearch(value);
  };

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize: pageSize,
    });
  };

  const handleAdvancedFilter = (filters: BookingFilters) => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    setAdvancedFilters(filters);
    setIsAdvanceFilterOpen(false);
  };

  const handleResetFilters = () => {
    setAdvancedFilters({});
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleRowClick = (record: BookingData) => {
    console.log("Row clicked:", record);
    navigate(`/booking/${record._id}`);
  };

  const handleAddBooking = () => {
    navigate("/booking/add-booking");
  };

  const toggleAdvanceFilter = () => {
    setIsAdvanceFilterOpen(!isAdvanceFilterOpen);
  };

  // Apply filters when they change or pagination changes
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div className="min-h-screen p-4 space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Upcoming Payments
        </h2>
      </div>

      {/* Header with search and buttons */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center">
            <SearchForm
              onSearch={handleSearch}
              placeholder="Search by name or contact name"
              searchTerm={searchText}
            />
          </div>
          <div className="flex gap-3">
            {/* <ButtonDefault
              label="Advanced Filter"
              onClick={toggleAdvanceFilter}
            /> */}
            <ButtonDefault
              label="Add Booking"
              variant="secondary"
              icon={<PlusOutlined />}
              onClick={handleAddBooking}
            />
          </div>
        </div>

        {/* Advanced Filter UI */}
        {isAdvanceFilterOpen && (
          <BookingAdvanceFilterUI
            onFilter={handleAdvancedFilter}
            onReset={handleResetFilters}
            loading={loading}
            setIsAdvanceFilterEnable={setIsAdvanceFilterOpen}
          />
        )}
      </div>

      {/* Table Section */}
      <Card className="bg-white dark:bg-gray-800" bordered={false}>
        <div className="mb-4 flex justify-between items-center">
          <span className="text-gray-700 dark:text-gray-300">
            Showing {bookings.length} bookings
          </span>
        </div>

        <CustomAntdTable
          columns={columns}
          dataSource={bookings}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handleTableChange,
            pageSizeOptions: ["10", "20", "50", "100"],
            showSizeChanger: true,
          }}
          isLoading={loading}
          onRow={(record: BookingData) => ({
            onClick: () => handleRowClick(record),
          })}
          rowClassName="cursor-pointer"
        />
      </Card>
    </div>
  );
};

export default UpcomingPayments;
