import { useState, useEffect, useMemo } from "react";
import CustomAntdTable from "../../components/Tables/CustomAntdTable";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import { debounce } from "lodash";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Tag, Space, Image } from "antd";

interface EBook {
  key: string;
  title: string;
  fileUrl: string;
  format: string;
  category: string;
  isFree: boolean;
  price: number;
  views: number;
  downloads: number;
  status: string;
  createdAt: string;
  thumbnail?: string;
  description?: string;
  pages?: number;
}

const AllEBooks = () => {
  const navigate = useNavigate();
  const [ebooks, setEBooks] = useState<EBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      setPagination({ ...pagination, current: 1 });
      fetchEBooks(term);
    }, 500),
    [pagination]
  );

  const fetchEBooks = async (search: string = "") => {
    setLoading(true);
    try {
      const response = await API.getAuthAPI(END_POINT.EBOOKS, true, { search, page: pagination.current, limit: pagination.pageSize });
      if (response.error) throw new Error(response.error);
      
      const ebooksData = response.data?.ebooks || response.data || [];
      const ebooksList = (Array.isArray(ebooksData) ? ebooksData : []).map((ebook: any) => ({
        key: ebook._id || ebook.id,
        title: ebook.title,
        fileUrl: ebook.fileUrl,
        format: ebook.format || "PDF",
        category: ebook.category || "General",
        isFree: ebook.isFree || ebook.price === 0,
        price: ebook.price || 0,
        views: ebook.views || 0,
        downloads: ebook.downloads || 0,
        status: ebook.status || "draft",
        createdAt: ebook.createdAt,
        description: ebook.description,
        thumbnail: ebook.thumbnail,
        pages: ebook.pages,
      }));
      
      setEBooks(ebooksList);
      setPagination({ ...pagination, total: response.data?.pagination?.total || ebooksList.length });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch ebooks");
      setEBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEBooks();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (searchTerm !== "") {
      debouncedSearch(searchTerm);
    } else {
      fetchEBooks();
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  const handleDelete = async (ebookId: string) => {
    if (!window.confirm("Are you sure you want to delete this ebook?")) return;

    try {
      const response = await API.DeleteAuthAPI(ebookId, END_POINT.EBOOKS, true);
      if (response.error) throw new Error(response.error);
      
      toast.success("E-Book deleted successfully");
      fetchEBooks();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete ebook");
    }
  };

  const columns = [
    {
      title: "Cover",
      dataIndex: "thumbnail",
      key: "thumbnail",
      width: 80,
      render: (thumbnail: string) => 
        thumbnail ? (
          <Image src={thumbnail} alt="Cover" width={50} height={60} className="rounded" />
        ) : (
          <div className="w-[50px] h-[60px] bg-gray-200 rounded flex items-center justify-center text-gray-500">
            PDF
          </div>
        ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: EBook) => (
        <div>
          <div className="font-semibold">{text}</div>
          {record.description && (
            <div className="text-xs text-gray-500 truncate w-64">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: "Format",
      dataIndex: "format",
      key: "format",
      width: 80,
      render: (format: string) => <Tag color="blue">{format}</Tag>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 120,
    },
    {
      title: "Type",
      dataIndex: "isFree",
      key: "isFree",
      width: 100,
      render: (isFree: boolean) => (
        <Tag color={isFree ? "green" : "orange"}>{isFree ? "Free" : "Premium"}</Tag>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (price: number, record: EBook) => 
        record.isFree ? "Free" : `₹${price}`,
    },
    {
      title: "Views",
      dataIndex: "views",
      key: "views",
      width: 80,
      sorter: (a: EBook, b: EBook) => a.views - b.views,
    },
    {
      title: "Downloads",
      dataIndex: "downloads",
      key: "downloads",
      width: 100,
      sorter: (a: EBook, b: EBook) => a.downloads - b.downloads,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={status === "published" ? "green" : status === "draft" ? "orange" : "red"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: EBook) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => window.open(record.fileUrl, '_blank')} 
          />
          <Button 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/ebooks/${record.key}/edit`)} 
          />
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.key)} 
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All E-Books</h1>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/ebooks/create")}
            >
              Add E-Book
            </Button>
          </div>

          <CustomAntdTable
            columns={columns}
            data={ebooks}
            loading={loading}
            pagination={pagination}
            setPagination={setPagination}
            onChange={(pagination: any) => {
              setPagination({ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total });
            }}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchPlaceholder="Search ebooks..."
          />
        </div>
      </div>
    </div>
  );
};

export default AllEBooks;

