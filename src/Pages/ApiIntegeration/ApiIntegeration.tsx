import { useEffect, useState } from "react";
import { CopyOutlined } from "@ant-design/icons";
import TextAreaCustom from "../../components/FormElements/TextArea/TextAreaCustom";
import SelectGroupOne from "../../components/FormElements/SelectGroup/SelectGroupOne";
import Heading from "../../components/CommonUI/Heading";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import { Link } from "react-router-dom";
import BlurTv from "../../components/CommonUI/NoDataFound/BlurTv";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";
import { getStoredSources } from "../../api/commonAPI";
import { toast } from "react-toastify";

interface LeadSource {
  value: string;
  label: string;
}

const tempData = getStoredSources(true);
export default function ApiIntegeration() {
  const [curl, setCurl] = useState("");

  const [selectedService, setSelectedService] = useState("");
  const [data, setData] = useState<LeadSource[]>([]);
  // const [data, setData] = useState<LeadSource[]>(tempData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLeadSources();
  }, []);

  const fetchLeadSources = async () => {
    try {
      setIsLoading(true);
      const { data: response, error } = await API.getAuthAPI(
        END_POINT.LEAD_SOURCES,
        true
      );

      if (error) return;

      if (response) {
        // Transform API response to match component's data structure
        const filteredData = response.filter(
          (item: { isApiRequired: boolean }) => item.isApiRequired
        );
        const transformedData: LeadSource[] = filteredData.map((item: any) => ({
          value: item._id,
          label: item.name,
        }));
        setData(transformedData);
      }
    } catch (error: any) {
      console.error(error.message || "Failed to fetch lead sources");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurl = async (id: string) => {
    try {
      setIsLoading(true);

      const { data, error } = await API.getAuthAPI(
        `${END_POINT.GET_CURL}?leadSource=${id}`,
        true
      );

      if (error) return;

      setCurl(data?.curlCommand);
    } catch (error: any) {
      console.error(error.message || "Failed to fetch leads");
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = () => {
    navigator.clipboard
      .writeText(curl)
      .then(() => {
        toast.success("Text copied to clipboard");
      })
      .catch((err) => {
        toast.error("Failed to copy text: ", err);
      });
  };

  const handleChange = (value: string) => {
    fetchCurl(value);
    setSelectedService(value);
  };

  if (isLoading) {
    return <MiniLoader />;
  }
  return (
    <div className="flex w-full h-full flex-col items-start gap-3 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <Heading title="Integerate Lead Outsourcing Partner" />

      {data?.length ? (
        <>
          <div className="flex flex-col items-center gap-3 w-full sm:w-auto sm:flex-row ">
            <span className="sm:w-[347px] w-auto text-base font-semibold text-dark dark:text-white">
              Choose your API Service:
            </span>
            <SelectGroupOne
              options={data}
              wrapperClasses="w-[300px]"
              selectedOption={selectedService}
              setSelectedOption={handleChange}
            />
          </div>
          <div className="relative w-full">
            {curl && (
              <CopyOutlined
                className={`absolute right-[14px] top-[18px] ${
                  curl
                    ? "cursor-pointer text-blue"
                    : "cursor-not-allowed opacity-50"
                }`}
                onClick={copyText}
              />
            )}
            <TextAreaCustom
              rows={12}
              placeholder="Your curl will appear here."
              customClasses="w-full"
              value={curl}
              readOnly
              onChange={(e) => {
                // e.target.value will be properly typed as string
                console.log(e.target.value);
              }}
            />
          </div>
        </>
      ) : (
        <div className="w-full h-[100%] flex flex-col gap-8 justify-center items-center text-base font-semibold text-dark dark:text-white">
          <BlurTv message="404 No Data Found!" />
          <span className="text-center">
            No API Service found. <br /> You can enable them from <br />
            <Link to="/settings/3">
              <span className="hover:text-blue hover:underline">
                {" Setting >> CRM Field >> Lead Source Name "}
              </span>
            </Link>
          </span>
        </div>
      )}
    </div>
  );
}
