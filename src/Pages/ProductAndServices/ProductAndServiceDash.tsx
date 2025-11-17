import { useEffect } from "react";
import DynamicDataManagement from "../../components/DynamicDataManagement/DynamicDataManagement";
import { useProductAndService } from "../../CustomHooks/useProductAndService";

const fields = [
  {
    name: "productName",
    label: "Product & Service Name",
    type: "text",
  },
  { name: "setupFee", label: "Setup fee", type: "number" },
  { name: "price", label: "Price", type: "number" },
];

const columns = [
  {
    title: "S.N.",
    dataIndex: "sn",
    key: "sn",
  },
  {
    title: "Product Name",
    dataIndex: "productName",
    key: "productName",
    minWidth: 150,
  },
  {
    title: "Setup Fee",
    dataIndex: "setupFee",
    key: "setupFee",
    minWidth: 120,
    render: (price: number) => `Rs. ${price}`,
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
    render: (price: number) => `Rs. ${price}`,
    minWidth: 120,
  },
  {
    title: "Orders",
    dataIndex: "order",
    key: "order",
    render: (order: number) => `${order}`,
  },
];

const ProductAndServiceDash = () => {
  const { 
    data, 
    isLoading, 
    fetchProductServices, 
    addProductService, 
    editProductService, 
    deleteProductService, 
    updateProductServiceStatus 
  } = useProductAndService();

  useEffect(() => {
    fetchProductServices();
  }, [fetchProductServices]);

  return (
    <div className="mx-auto max-w-7xl">
      <DynamicDataManagement
        title="Product and Service"
        fields={fields}
        columns={columns}
        data={data}
        onAdd={addProductService}
        onEdit={editProductService}
        onDelete={deleteProductService}
        onSoftDelete={updateProductServiceStatus}
        isLoading={isLoading}
        customClasses="p-6 shadow-md dark:bg-gray-800"
      />
    </div>
  );
};

export default ProductAndServiceDash;
