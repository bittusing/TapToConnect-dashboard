import React, { useState, useRef, useEffect } from "react";
import { Button, Spin, message, Tooltip } from "antd";
import { FaMapMarkedAlt } from "react-icons/fa";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import InputGroup from "../../components/FormElements/InputGroup";
import FileUploadFillType from "../../components/FormElements/FileUpload/FileUploadFillType";
import CustomAntdTable from "../../components/Tables/CustomAntdTable";
import useGetLocation from "../../hooks/useGetLocation";
import axios from "axios";
import { BASE_URL } from "../../api/UrlProvider";
import { getAuthHeader } from "../../utils/TokenVerify";

interface Location {
  latitude: number;
  longitude: number;
}

interface GeoLocation {
  _id: string;
  fileName: string;
  originalName: string;
  s3Url: string;
  coordinates: string;
  createdAt: string;
}

interface AttachmentTabProps {
  geoLocations?: GeoLocation[];
  leadId?: string;
}

const AttachmentTab: React.FC<AttachmentTabProps> = ({ geoLocations = [], leadId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [getLocationToggle, setGetLocationToggle] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { error, location: locationValue, loading } = useGetLocation({
    getLocationToggle,
    setGetLocationToggle,
  });

  useEffect(() => {
    const transformedFiles = geoLocations.map((item, index) => {
      const [lat, lng] = item.coordinates.split(",");
      return {
        key: item._id,
        serial: index + 1,
        file: item.originalName,
        fileName: item.fileName,
        fileUrl: item.s3Url,
        location: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng)
        },
        created: new Date(item.createdAt).toLocaleString()
      };
    });
    setUploadedFiles(transformedFiles);
  }, [geoLocations]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setGetLocationToggle(true);
    }
  };

  const handleFileNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.value);
  };

  const handleUpload = async () => {
    if (!selectedFile || !locationValue || !leadId) {
      message.error('Please ensure file, location and lead ID are available');
      return;
    }

    try {
      setIsUploading(true);

      // Create FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('leadId', leadId);
      formData.append('coordinates', `${locationValue.latitude},${locationValue.longitude}`);

      // Get auth header
      const authHeader = await getAuthHeader();

      // Make direct axios call to handle multipart/form-data
      const response = await axios({
        method: 'post',
        url: `${BASE_URL}geo-location`,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': authHeader
        }
      });

      if (response.data.error) {
        throw new Error(response.data.message || 'Upload failed');
      }

      // Update UI with new file
      const newFile = {
        key: response.data._id,
        serial: uploadedFiles.length + 1,
        file: selectedFile.name,
        fileName: fileName || selectedFile.name,
        fileUrl: response.data.s3Url,
        location: locationValue,
        created: new Date().toLocaleString()
      };
      
      setUploadedFiles([...uploadedFiles, newFile]);
      message.success('File uploaded successfully');

      // Reset form
      setSelectedFile(null);
      setFileName("");
      setGetLocationToggle(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      message.error(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!error) return;
    message.error(error, 3);
  }, [error]);

  const columns = [
    { title: "Serial", dataIndex: "serial", key: "serial" },
    { 
      title: "File", 
      dataIndex: "file", 
      key: "file",
      render: (text: string, record: any) => (
        <a href={record.fileUrl} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      )
    },
    { title: "File Name", dataIndex: "fileName", key: "fileName" },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (value: Location) => (
        <span>
          {value ? `${value.latitude}, ${value.longitude}` : "No location available"}
        </span>
      )
    },
    { title: "Created", dataIndex: "created", key: "created" },
    {
      title: "Action",
      dataIndex: "location",
      key: "action",
      render: (record: Location) => (
        <div className="flex items-center gap-2">
          <a
            href={`https://www.google.com/maps?q=${record?.latitude},${record?.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Tooltip title="Click to Reveal location on Google Maps">
              <Button
                icon={<FaMapMarkedAlt className="text-xl text-blue-light dark:text-blue-light-2" />}
                size="middle"
                className="dark:text-white"
              />
            </Tooltip>
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-lg bg-white dark:bg-transparent dark:text-white">
      <div className="mb-6">
        <div className="mb-4 flex w-full items-center border-b-2 border-solid border-gray py-2">
          <span className="w-[220px] text-lg font-medium">Attach file </span>
        </div>
        <div className="flex w-full flex-col items-center space-x-4">
          <div className="flex w-full flex-col items-center gap-3 sm:flex-row">
            <div className="w-full">
              <FileUploadFillType
                onChange={handleFileChange}
                ref={fileInputRef}
                id="fileInput"
                required={true}
              />
            </div>
            {loading ? (
              <div className="flex w-full items-center justify-center gap-4">
                <Spin />
                Fetching location...
              </div>
            ) : (
              <InputGroup
                placeholder="Upload file to fetch your current location."
                customClasses="w-full"
                value={
                  locationValue
                    ? `${locationValue.latitude}, ${locationValue.longitude}`
                    : "Upload file to fetch your current location."
                }
                readOnly
              />
            )}
            <InputGroup
              placeholder="Enter File Name"
              value={fileName}
              onChange={handleFileNameChange}
              customClasses="w-full"
            />
            <div className="flex gap-3">
              <ButtonDefault
                mode="link"
                disabled={!locationValue}
                label="View on Map"
                link={`https://www.google.com/maps?q=${locationValue?.latitude},${locationValue?.longitude}`}
                target="_blank"
              />
              <ButtonDefault
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                label={isUploading ? "Uploading..." : "Upload"}
                variant="primary"
              />
            </div>
          </div>
        </div>
      </div>

      <CustomAntdTable
        columns={columns}
        dataSource={uploadedFiles}
        pagination={false}
        className="w-full"
      />
    </div>
  );
};

export default AttachmentTab;