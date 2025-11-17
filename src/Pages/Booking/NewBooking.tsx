import React, { useState, useEffect, useCallback } from "react";
import { Card, Tag, Button } from "antd";
import { EditFilled } from "@ant-design/icons";
import { debounce } from "lodash";
import { Link, useNavigate } from "react-router-dom";
import CustomAntdTable from "../../components/Tables/CustomAntdTable";
import SearchForm from "../../components/Header/SearchForm";
import { API } from "../../api";

interface BookingData {
  key: string;
  _id: string;
  customer: string;
  contactName: string;
  leadId: string;
  email: string;
  bookingDate: string;
  totalReceived: number;
  bookingStatus: string;
  createdAt: string;
}

const NewBooking: React.FC = () => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  
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
      title: "Customer Name",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Contact Name",
      dataIndex: "contactName",
      key: "contactName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => email || "-",
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

      // Call the API
      const { data, error } = await API.getAuthAPI(
        `new-booking?${params.toString()}`,
        true
      );

      if (error) {
        throw new Error(error);
      }

      // Process and set the data
      if (data && data.docs) {
        const formattedBookings = data.docs.map((booking: any) => ({
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
      console.error('Error fetching new bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, sortInfo]);

  const debouncedSearch = debounce((value: string) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  }, 0);

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

  const handleRowClick = (record: BookingData) => {
    navigate(`/booking/${record._id}`);
  };

  // Apply filters when they change
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div className="min-h-screen p-4 space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          New Bookings
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Recently created bookings that need attention
        </p>
      </div>

      {/* Header with search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center">
            <SearchForm
              onSearch={handleSearch}
              placeholder="Search by name or email"
              searchTerm={searchText}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <Card className="bg-white dark:bg-gray-800" bordered={false}>
        <div className="mb-4 flex justify-between items-center">
          <span className="text-gray-700 dark:text-gray-300">
            Showing {bookings.length} new bookings
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

export default NewBooking;