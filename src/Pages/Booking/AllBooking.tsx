import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, Tag, Space, Button } from "antd";
import { EditFilled, PlusOutlined } from "@ant-design/icons";
import { debounce } from "lodash";
import { Link, useNavigate } from "react-router-dom";
import CustomAntdTable from "../../components/Tables/CustomAntdTable";
import SearchForm from "../../components/Header/SearchForm";
import BookingAdvanceFilterUI from "./BookingAdvanceFilterUI";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import { API } from "../../api";

interface BookingData {
  key: string;
  _id: string;
  customer: string;
  contactName: string;
  contactNumber?: string;
  bookingAmount: number;
  BSP: number;
  status: string;
  bookingStatus: string;
  reference: {
    employee: string;
    tlcp: string;
    avp: string;
    vp: string;
    as: string;
    agm: string;
    gm: string;
    vertical: string;
  };
  bookingDate: string;
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

interface BookingResponseItem {
  _id: string;
  customer: string;
  contactName: string;
  BSP: number;
  bookingStatus: string;
  reference: {
    employee: string;
    tlcp: string;
    avp: string;
    vp: string;
    as: string;
    agm: string;
    gm: string;
    vertical: string;
  };
  bookingDate: string;
  [key: string]: unknown;
}

const AllBooking: React.FC = () => {
  // State for table data
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isAdvanceFilterOpen, setIsAdvanceFilterOpen] = useState(false);
  const navigate=useNavigate()
  console.log({bookings});
  
  // State for filters
  const [advancedFilters, setAdvancedFilters] = useState<BookingFilters>({});

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Sorting state
  const [sortInfo] = useState({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Table columns
  const columns = [
    {
      title: "Name",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Contact Name",
      dataIndex: "contactName",
      key: "contactName",
    },
    {
      title: "Total Received Amount",
      dataIndex: "totalReceived",
      key: "totalReceived",
      render: (amount: number) => `₹${amount.toLocaleString("en-IN")}`,
    },
    {
      title: "Booking Status",
      dataIndex: "bookingStatus",
      key: "bookingStatus",
      render: (status: string) => (
        <Tag
          color={
            status === "confirmed"
              ? "green"
              : status === "pending"
              ? "gold"
              : "red"
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: BookingData) => (
        <Link to={`/booking/${record._id}`}>
          <Button
            icon={<EditFilled />}
            className="bg-transparent text-primary dark:text-blue-400"
          />
        </Link>
      ),
    },
  ];

  // Function to fetch bookings from API
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      // Construct API parameters
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.pageSize.toString(),
        sortBy: sortInfo.sortBy,
        sortOrder: sortInfo.sortOrder
      });

      // Add search parameter if it exists
      if (searchText) {
        params.append('search', searchText);
      }

      // Add advanced filters if they exist
      if (advancedFilters.employee) params.append('employee', advancedFilters.employee);
      if (advancedFilters.tlcp) params.append('tlcp', advancedFilters.tlcp);
      if (advancedFilters.avp) params.append('avp', advancedFilters.avp);
      if (advancedFilters.vp) params.append('vp', advancedFilters.vp);
      if (advancedFilters.as) params.append('as', advancedFilters.as);
      if (advancedFilters.agm) params.append('agm', advancedFilters.agm);
      if (advancedFilters.gm) params.append('gm', advancedFilters.gm);
      if (advancedFilters.vertical) params.append('vertical', advancedFilters.vertical);
      if (advancedFilters.startDate) params.append('startDate', advancedFilters.startDate);
      if (advancedFilters.endDate) params.append('endDate', advancedFilters.endDate);

      // Call the API
      const endpoint = `get-booking-list?${params.toString()}`;
      const { data, error } = await API.getAuthAPI(endpoint, true);

      if (error) {
        throw new Error(error);
      }

      // Process and set the data
      if (data && data.docs) {
        const formattedBookings = data.docs.map((booking: BookingResponseItem) => ({
          ...booking,
          key: booking._id,
        }));
        
        setBookings(formattedBookings);
        setPagination({
          ...pagination,
          total: data.totalCount || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, advancedFilters, sortInfo]);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchText(value);
        setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page on new search
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
    navigate(`/booking/${record._id}`);
  };

  const handleAddBooking = () => {
    navigate("/booking/add-booking");
  };

  const toggleAdvanceFilter = () => {
    setIsAdvanceFilterOpen(!isAdvanceFilterOpen);
  };

  // Apply filters when they change
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings, pagination.current, pagination.pageSize, searchText, advancedFilters, sortInfo]);

  return (
    <div className="min-h-screen p-4 space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          All Bookings
        </h2>
      </div>

      {/* Header with search and buttons */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center">
            <SearchForm
              onSearch={handleSearch}
              placeholder="Search by name"
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

export default AllBooking;
