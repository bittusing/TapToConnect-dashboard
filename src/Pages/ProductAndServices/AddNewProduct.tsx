import React, { useState } from "react";
import InputGroup from "../../components/FormElements/InputGroup";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
interface ProductService {
  key?: string;
  productName?: string;
  price?: number;
  setupFee?: number;
}

const AddNewProduct = ({
  data,
  handleSubmit,
}: {
  data: ProductService;
  handleSubmit: (enable: boolean, productData: ProductService) => void;
}) => {
  const [formData, setFormData] = useState({
    productServiceName: data?.productName || "",
    setupFee: data?.setupFee || 0,
    price: data?.price || 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmitLocal = () => {
    console.log("Submitting new service:", formData);
    handleSubmit(false, formData);
    // Implement your submit logic here
  };

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h2 className="mb-6 text-2xl font-semibold text-dark dark:text-white">
        Add New Services
      </h2>

      <div className="space-y-4">
        <InputGroup
          label="Product & Service Name"
          name="productServiceName"
          type="text"
          placeholder="Product & Service Name"
          value={formData.productServiceName}
          onChange={handleInputChange}
        />

        <InputGroup
          label="Setup fee"
          name="setupFee"
          type="number"
          placeholder="Setup fee"
          value={formData.setupFee}
          onChange={handleInputChange}
        />

        <InputGroup
          label="Price"
          name="price"
          type="number"
          placeholder="Payment"
          value={formData.price}
          onChange={handleInputChange}
        />
      </div>

      <div className="mt-6 flex justify-end">
        <ButtonDefault label="Submit" onClick={handleSubmitLocal} />
      </div>
    </div>
  );
};

export default AddNewProduct;
