import { useState, useCallback } from 'react';
import { API } from '../api';
import { END_POINT } from '../api/UrlProvider';
import { toast } from 'react-toastify';

interface ProductService {
  key: string;
  sn: number;
  productName: string;
  price: number;
  setupFee: number;
  order?: number;
  deleted?: boolean;
  isActive?: boolean;
}

interface OptionList {
  value: string;
  label: string;
}

interface ProductService {
  key: string;
  sn: number;
  productName: string;
  price: number;
  setupFee: number;
  order?: number;
  deleted?: boolean;
  isActive?: boolean;
}

interface ProductServiceResponse {
  _id: string;
  name: string;
  price: number;
  setupFee: number;
  deleted?: boolean;
  isActive?: boolean;
}

export interface ProductServicePayload {
  name: string;
  price: number;
  setupFee: number;
  deleted?: boolean;
  isActive?: boolean;
}

export const useProductAndService = (sendOptionList=false) => {
  const [data, setData] = useState<ProductService[]>([]);
  const [optionList, setOptionList] = useState<OptionList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProductServices = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: response } = await API.getAuthAPI(
        END_POINT.PRODUCT_SERVICE,
        true
      );

      if (response) {
        // Transform the API response to match the interface
        const transformedData: ProductService[] = response.map(
          (item: ProductServiceResponse, index: number) => ({
            key: item._id,
            sn: index + 1,
            productName: item.name || "",
            price: item.price || 0,
            setupFee: item.setupFee || 0,
            deleted: item.deleted || false,
            isActive: item.isActive !== undefined ? item.isActive : true,
            order: 2, // Default value as in the original component
          })
        );
        setData(transformedData);
        if(sendOptionList){
            const optionListTemp:OptionList[]=response.map((item: ProductServiceResponse)=>({
                value: item._id,
                label: item.name
            }))
            setOptionList(optionListTemp)
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch product services";
      console.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addProductService = useCallback(async (newItem: Omit<ProductService, 'key' | 'sn'>) => {
    try {
      setIsLoading(true);
      const payload: ProductServicePayload = {
        name: newItem.productName,
        price: Number(newItem.price),
        setupFee: Number(newItem.setupFee),
      };

      const { error } = await API.postAuthAPI(
        payload,
        END_POINT.PRODUCT_SERVICE,
        true
      );

      if (error) return false;

      toast.success("Product service added successfully!");
      await fetchProductServices(); // Refresh the list
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add product service";
      console.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProductServices]);

  const editProductService = useCallback(async (key: string, updatedItem: Partial<ProductService>) => {
    try {
      setIsLoading(true);

      const payload: ProductServicePayload = {
        name: updatedItem.productName!,
        price: Number(updatedItem.price),
        setupFee: Number(updatedItem.setupFee),
        // deleted: updatedItem.deleted,
      };

      const { data, error } = await API.updateAuthAPI(
        payload,
        key,
        END_POINT.PRODUCT_SERVICE,
        true
      );
      
      if (!data || error) return false;

      toast.success("Product service updated successfully!");
      await fetchProductServices(); // Refresh the list
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update product service";
      console.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProductServices]);

  const deleteProductService = useCallback(async (key: string) => {
    try {
      setIsLoading(true);
      const { error } = await API.DeleteAuthAPI(
        key,
        END_POINT.PRODUCT_SERVICE,
        true
      );

      if (error) return false;

      toast.success("Product service deleted successfully!");
      await fetchProductServices(); // Refresh the list
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete product service";
      console.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProductServices]);

  const updateProductServiceStatus = useCallback(async (key: string, status: boolean) => {
    try {
      setIsLoading(true);

      const payload = { isActive: !status };
      const { error } = await API.updateAuthAPI(
        payload,
        key,
        END_POINT.PRODUCT_SERVICE,
        true
      );
      
      if (error) return false;
      
      await fetchProductServices(); // Refresh the list
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update product service status";
      console.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProductServices]);

  return {
    data,
    optionList,
    isLoading,
    fetchProductServices,
    addProductService,
    editProductService,
    deleteProductService,
    updateProductServiceStatus
  };
};
