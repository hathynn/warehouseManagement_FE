import { useState } from "react";
import useApiService from "./useApi";
import { toast } from "react-toastify";

// Enum to match ImportStatus.java
export enum ImportStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export enum DetailStatus {
  LACK = "LACK",
  EXCESS = "EXCESS",
  MATCH = "MATCH"
}

// Interface to match ImportOrderCreateRequest.java
export interface ImportOrderCreateRequest {
  importRequestId: number;
  accountId: number;
  dateReceived: string;
  timeReceived: string;
  note?: string;
}

// Interface to match ImportOrderUpdateRequest.java
export interface ImportOrderUpdateRequest {
  importOrderId: number;
  status?: ImportStatus;
  dateReceived?: string;
  timeReceived?: string;
  note?: string;
}

// Interface to match ImportOrderResponse.java
export interface ImportOrderResponse {
  importOrderId: number;
  importRequestId: number;
  dateReceived: string;
  timeReceived: string;
  note?: string;
  status: ImportStatus;
  importOrderDetailIds: number[];
  createdBy: string;
  updatedBy: string;
  createdDate: string;
  updatedDate: string;
  paperIds?: number;
  assignedStaffId?: number;
}

// Interface to match ImportOrderDetailRequest.java
export interface ImportOrderDetailRequest {
  itemId: number;
  quantity: number;
  actualQuantity: number;
}

// Interface to match ImportOrderDetailResponse.java
export interface ImportOrderDetailResponse {
  importOrderDetailId: number;
  importOrderId: number;
  itemId: number;
  itemName: string;
  expectQuantity: number;
  actualQuantity: number;
  status: DetailStatus;
}

// Interface to match AssignStaffRequest.java
export interface AssignStaffRequest {
  importOrderId: number;
  accountId: number;
}

// Interface to match MetaDataDTO.java
export interface MetaDataDTO {
  hasNext: boolean;
  hasPrevious: boolean;
  limit: number;
  total: number;
  page: number;
}

// Interface to match ResponseDTO.java
export interface ResponseDTO<T> {
  content: T;
  message: string;
  status: number;
  metadata?: MetaDataDTO;
}

const useImportOrderService = () => {
  const { callApi, loading } = useApiService();
  const [importOrderId, setImportOrderId] = useState<number | null>(null);

  // Add new function to get all import orders
  const getAllImportOrders = async (
    page = 1,
    limit = 10
  ): Promise<ResponseDTO<ImportOrderResponse[]>> => {
    try {
      const response = await callApi(
        "get",
        `/import-order/page?page=${page}&limit=${limit}`
      );
      return response;
    } catch (error) {
      toast.error("Không thể lấy danh sách đơn nhập");
      console.error("Error fetching all import orders:", error);
      throw error;
    }
  };

  // Get all import orders for a specific import request with pagination
  const getImportOrdersByRequestId = async (
    importRequestId: number, 
    page = 1, 
    limit = 10
  ): Promise<ResponseDTO<ImportOrderResponse[]>> => {
    try {
      const response = await callApi(
        "get", 
        `/import-order/page/${importRequestId}?page=${page}&limit=${limit}`
      );
      return response;
    } catch (error) {
      toast.error("Không thể lấy danh sách đơn nhập");
      console.error("Error fetching import orders:", error);
      throw error;
    }
  };

  // Get import order by ID
  const getImportOrderById = async (importOrderId: number): Promise<ResponseDTO<ImportOrderResponse>> => {
    try {
      const response = await callApi("get", `/import-order/${importOrderId}`);
      return response;
    } catch (error) {
      toast.error("Không thể lấy thông tin đơn nhập");
      console.error("Error fetching import order:", error);
      throw error;
    }
  };

  // Create a new import order
  const createImportOrder = async (requestData: ImportOrderCreateRequest): Promise<ResponseDTO<ImportOrderResponse>> => {
    try {
      const response = await callApi("post", "/import-order", requestData);
      if (response && response.content) {
        setImportOrderId(response.content.importOrderId);
        toast.success("Tạo đơn nhập thành công");
      }
      return response;
    } catch (error) {
      toast.error("Không thể tạo đơn nhập");
      console.error("Error creating import order:", error);
      throw error;
    }
  };

  // Update an existing import order
  const updateImportOrder = async (requestData: ImportOrderUpdateRequest): Promise<ResponseDTO<ImportOrderResponse>> => {
    try {
      const response = await callApi("put", "/import-order", requestData);
      if (response && response.content) {
        toast.success("Cập nhật đơn nhập thành công");
      }
      return response;
    } catch (error) {
      toast.error("Không thể cập nhật đơn nhập");
      console.error("Error updating import order:", error);
      throw error;
    }
  };

  // Delete an import order
  const deleteImportOrder = async (importOrderId: number): Promise<ResponseDTO<null>> => {
    try {
      const response = await callApi("delete", `/import-order/${importOrderId}`);
      toast.success("Xóa đơn nhập thành công");
      return response;
    } catch (error) {
      toast.error("Không thể xóa đơn nhập");
      console.error("Error deleting import order:", error);
      throw error;
    }
  };

  // Assign staff to an import order
  const assignStaff = async (requestData: AssignStaffRequest): Promise<ResponseDTO<ImportOrderResponse>> => {
    try {
      const response = await callApi("post", "/import-order/assign-staff", requestData);
      if (response && response.content) {
        toast.success("Phân công nhân viên kho thành công");
      }
      return response;
    } catch (error) {
      toast.error("Không thể phân công nhân viên kho");
      console.error("Error assigning staff:", error);
      throw error;
    }
  };

  // Cancel an import order
  const cancelImportOrder = async (importOrderId: number): Promise<ResponseDTO<ImportOrderResponse>> => {
    try {
      const response = await callApi("post", `/import-order/cancel/${importOrderId}`);
      if (response && response.content) {
        toast.success("Hủy đơn nhập thành công");
      }
      return response;
    } catch (error) {
      toast.error("Không thể hủy đơn nhập");
      console.error("Error cancelling import order:", error);
      throw error;
    }
  };

  return {
    loading,
    importOrderId,
    getAllImportOrders,
    getImportOrdersByRequestId,
    getImportOrderById,
    createImportOrder,
    updateImportOrder,
    deleteImportOrder,
    assignStaff,
    cancelImportOrder,
  };
};

export default useImportOrderService;
