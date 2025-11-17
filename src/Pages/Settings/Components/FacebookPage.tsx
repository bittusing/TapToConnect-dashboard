import { useState, useEffect } from "react";
import DynamicDataManagement from "../../../components/DynamicDataManagement/DynamicDataManagement";
import { API } from "../../../api";
import { END_POINT } from "../../../api/UrlProvider";
import { toast } from "react-toastify";

interface LostReason {
    key: string;
    //reason: string;
    pageName: string;
    pageId: string;
    accessToken: string;
    isActive?: boolean;
    order?: number;
}

export default function FacebookPage() {
    const [data, setData] = useState<LostReason[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fields = [

        {
            name: "pageName",
            label: "Page Name",
            type: "text",
        },
        {
            name: "pageId",
            label: "Page Id",
            type: "text",
        },
        {
            name: "accessToken",
            label: "Page Access Token",
            type: "text",
        }

    ];

    const columns = [
        {
            title: "S.No",
            dataIndex: "index",
            key: "index",
            render: (_text: any, _record: any, index: number) => index + 1,
        },
        {
            title: "Page Name",
            dataIndex: "pageName",
            key: "pageName",
        },
        {
            title: "PageId",
            dataIndex: "pageId",
            key: "pageId",
        },
        // {
        //     title: "Page Access Token",
        //     dataIndex: "accessToken",
        //     key: "accessToken",
        // },
    ];

    const fetchLostReasons = async () => {
        try {
            setIsLoading(true);
            const { data: response, error } = await API.getAuthAPI(
                END_POINT.FACEBOOK_PAGE,
                true
            );

            if (error) return;

            if (response) {
                const transformedData: LostReason[] = response.map((item: any) => ({
                    key: item._id,
                    pageName: item.pageName,
                    pageId: item.pageId,
                    accessToken: item.accessToken,
                    // accessToken: item.accessToken
                    //     ? item.accessToken.substring(0, 20) + "..."
                    //     : "",
                }));
                setData(transformedData);
            }
        } catch (error: any) {
            console.error(error.message || "Failed to fetch lost reasons");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLostReasons();
    }, []);

    const handleAdd = async (newItem: any) => {
        try {
            setIsLoading(true);
            const payload = {
                pageName: newItem.pageName,
                pageId: newItem.pageId,
                accessToken: newItem.accessToken,
                // isActive: newItem.isActive,
                // order: newItem.order,
            };

            const { error } = await API.postAuthAPI(payload, END_POINT.FACEBOOK_PAGE, true);

            if (error) return;

            toast.success("Facebook Page added successfully!");
            fetchLostReasons();
        } catch (error: any) {
            console.error(error.message || "Failed to add lost reason");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async (key: string, updatedItem: any) => {
        try {
            setIsLoading(true);
            const payload = {
                pageName: updatedItem.pageName,
                pageId: updatedItem.pageId,
                accessToken: updatedItem.accessToken,
            };

            const { error } = await API.updateAuthAPI(
                payload,
                key,
                END_POINT.FACEBOOK_PAGE,
                true
            );

            if (error) return;

            toast.success("Facebook Page updated successfully!");
            fetchLostReasons();
        } catch (error: any) {
            console.error(error.message || "Failed to update lost reason");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (key: string) => {
        try {
            setIsLoading(true);
            const { error } = await API.DeleteAuthAPI(key, END_POINT.LOST_REASON, true);

            if (error) return;

            toast.success("Lost reason deleted successfully!");
            fetchLostReasons();
        } catch (error: any) {
            console.error(error.message || "Failed to delete lost reason");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSoftDelete = async (key: string, currentStatus: boolean) => {
        try {
            setIsLoading(true);
            const { error } = await API.DeleteAuthAPI(
                key,
                END_POINT.LOST_REASON,
                true
            );

            if (error) return;

            toast.success("Status field deleted successfully!");
            fetchLostReasons();
        } catch (error: any) {
            console.error(error.message || "Failed to delete status field");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (key: string, status: boolean) => {
        try {
            setIsLoading(true);
            const payload = {
                isActive: !status,
            };

            const { error } = await API.updateAuthAPI(
                payload,
                key,
                END_POINT.LOST_REASON,
                true
            );

            if (error) return;
            fetchLostReasons();
        } catch (error: any) {
            console.error(error.message || "Failed to update status");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DynamicDataManagement
            title="Facebook Page List"
            fields={fields}
            columns={columns}
            data={data}
            onAdd={handleAdd}
            onEdit={handleEdit}
           // onDelete={handleDelete}
            //onSoftDelete={handleSoftDelete}
            onUpdate={handleUpdate}
            isLoading={isLoading}
        />
    );
}
