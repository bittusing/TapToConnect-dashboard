import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import InputGroup from "../../components/FormElements/InputGroup";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";
import { useNavigate } from "react-router-dom";
import SelectGroupAntd from "../../components/FormElements/SelectGroup/SelectGroupAntd";
import TextAreaCustom from "../../components/FormElements/TextArea/TextAreaCustom";
import { Select, InputNumber } from "antd";

interface EBookFormData {
  title: string;
  description: string;
  fileUrl: string;
  thumbnail: string;
  fileSize: number;
  format: string;
  category: string;
  price: number;
  tags: string[];
  language: string;
  pages: number;
  isbn: string;
  status: string;
}

const initialFormState: EBookFormData = {
  title: "",
  description: "",
  fileUrl: "",
  thumbnail: "",
  fileSize: 0,
  format: "PDF",
  category: "",
  price: 0,
  tags: [],
  language: "English",
  pages: 0,
  isbn: "",
  status: "draft",
};

const categories = [
  { label: "Programming", value: "Programming" },
  { label: "Web Development", value: "Web Development" },
  { label: "Data Science", value: "Data Science" },
  { label: "Design", value: "Design" },
  { label: "Business", value: "Business" },
  { label: "Education", value: "Education" },
];

const formats = [
  { label: "PDF", value: "PDF" },
  { label: "EPUB", value: "EPUB" },
  { label: "MOBI", value: "MOBI" },
  { label: "DOCX", value: "DOCX" },
];

const languages = [
  { label: "English", value: "English" },
  { label: "Hindi", value: "Hindi" },
  { label: "Spanish", value: "Spanish" },
  { label: "French", value: "French" },
];

const statuses = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

export default function CreateEBook() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<EBookFormData>(initialFormState);
  const [availableTags, setAvailableTags] = useState<Array<{ label: string; value: string }>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await API.getAuthAPI(END_POINT.TAGS, true);
      if (!response.error && response.data) {
        const tagsList = (response.data || []).map((tag: any) => ({
          label: tag.name,
          value: tag.tagValue || tag.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
        }));
        setAvailableTags(tagsList);
      }
    } catch (error) {
      console.error("Failed to fetch tags");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "fileSize" || name === "pages" ? parseFloat(value) || 0 : value,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("E-Book title is required");
      return false;
    }
    if (!formData.fileUrl.trim()) {
      toast.error("File URL is required");
      return false;
    }
    if (formData.fileSize <= 0) {
      toast.error("File size is required");
      return false;
    }
    if (!formData.category) {
      toast.error("Please select a category");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        fileUrl: formData.fileUrl,
        thumbnail: formData.thumbnail,
        fileSize: formData.fileSize,
        format: formData.format,
        category: formData.category,
        price: formData.price,
        tags: formData.tags,
        language: formData.language,
        pages: formData.pages,
        isbn: formData.isbn,
        status: formData.status,
      };

      const { data, error } = await API.postAuthAPI(payload, END_POINT.EBOOKS, true);
      if (error || !data) throw new Error(error);
      
      toast.success("E-Book created successfully!");
      navigate("/ebooks");
    } catch (error: any) {
      toast.error(error.message || "Failed to create ebook");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <MiniLoader />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create New E-Book</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputGroup
              label="E-Book Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter ebook title"
              required
            />

            <TextAreaCustom
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter ebook description"
              rows={6}
            />

            <div className="grid grid-cols-2 gap-4">
              <InputGroup
                label="File URL"
                name="fileUrl"
                value={formData.fileUrl}
                onChange={handleInputChange}
                placeholder="https://s3.amazonaws.com/bucket/ebook.pdf"
                required
              />

              <InputGroup
                label="Thumbnail URL"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleInputChange}
                placeholder="https://s3.amazonaws.com/bucket/thumbnail.jpg"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  File Size (bytes)
                </label>
                <InputNumber
                  className="w-full"
                  value={formData.fileSize}
                  onChange={(value) => setFormData((prev) => ({ ...prev, fileSize: value || 0 }))}
                  min={0}
                  placeholder="2516582"
                />
              </div>

              <SelectGroupAntd
                label="Format"
                selectedOption={formData.format}
                setSelectedOption={(value) => setFormData((prev) => ({ ...prev, format: value }))}
                options={formats}
              />

              <SelectGroupAntd
                label="Category"
                selectedOption={formData.category}
                setSelectedOption={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                options={categories}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Price (₹)
                </label>
                <InputNumber
                  className="w-full"
                  value={formData.price}
                  onChange={(value) => setFormData((prev) => ({ ...prev, price: value || 0 }))}
                  min={0}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">0 = Free, &gt;0 = Premium</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Pages
                </label>
                <InputNumber
                  className="w-full"
                  value={formData.pages}
                  onChange={(value) => setFormData((prev) => ({ ...prev, pages: value || 0 }))}
                  min={0}
                  placeholder="250"
                />
              </div>

              <SelectGroupAntd
                label="Language"
                selectedOption={formData.language}
                setSelectedOption={(value) => setFormData((prev) => ({ ...prev, language: value }))}
                options={languages}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputGroup
                label="ISBN"
                name="isbn"
                value={formData.isbn}
                onChange={handleInputChange}
                placeholder="978-1234567890"
              />
              
              <SelectGroupAntd
                label="Status"
                selectedOption={formData.status}
                setSelectedOption={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                options={statuses}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Tags
              </label>
              <Select
                mode="multiple"
                placeholder="Select tags"
                value={formData.tags}
                onChange={(value) => setFormData((prev) => ({ ...prev, tags: value }))}
                options={availableTags}
                className="w-full"
              />
            </div>

            <div className="flex gap-4 mt-6">
              <ButtonDefault
                type="submit"
                label="Create E-Book"
                variant="primary"
                loading={isLoading}
              />
              <ButtonDefault
                type="button"
                label="Cancel"
                variant="outline"
                onClick={() => navigate("/ebooks")}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

