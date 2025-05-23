import { useState } from "react";
import useApiService, { ResponseDTO } from "./useApi";
import { toast } from "react-toastify";
import { ImportStatus } from "@/utils/enums";


export interface ImportOrderCreateRequest {
  importRequestId: string | null;
  accountId: number | null;
  dateReceived: string;
  timeReceived: string;
  note?: string;
}

export interface AssignStaffRequest {
  importOrderId: string;
  accountId: number;
}

export interface ExtendImportOrderRequest {
  importOrderId: string;
  extendedDate: string;
  extendedTime: string;
  extendedReason: string;
}

export interface ImportOrderResponse {
  importOrderId: string;
  importRequestId: string;
  dateReceived: string;
  timeReceived: string;
  isExtended: boolean;
  extendedDate: string;
  extendedTime: string;
  extendedReason: string;
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

const useImportOrderService = () => {
  const { callApi, loading } = useApiService();
  const [importOrderId, setImportOrderId] = useState<string | null>(null);

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

  const getAllImportOrdersByImportRequestId = async (
    importRequestId: string
  ): Promise<ResponseDTO<ImportOrderResponse[]>> => {
    try {
      const response = await callApi(
        "get", 
        `/import-order/import-request/${importRequestId}`
      );
      return response;
    } catch (error) {
      toast.error("Không thể lấy danh sách đơn nhập");
      console.error("Error fetching import orders:", error);
      throw error;
    }
  };

  const getImportOrderById = async (importOrderId: string): Promise<ResponseDTO<ImportOrderResponse>> => {
    try {
      const response = await callApi("get", `/import-order/${importOrderId}`);
      return response;
    } catch (error) {
      toast.error("Không thể lấy thông tin đơn nhập");
      console.error("Error fetching import order:", error);
      throw error;
    }
  };

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

  const completeImportOrder = async (importOrderId: string): Promise<ResponseDTO<ImportOrderResponse>> => {
    try {
      const response = await callApi("post", `/import-order/complete/${importOrderId}`);
      if (response && response.content) {
        toast.success("Hoàn tất đơn nhập thành công");
      }
      return response;
    } catch (error) {
      toast.error("Không thể hoàn tất đơn nhập");
      console.error("Error completing import order:", error);
      throw error;
    }
  };

  const cancelImportOrder = async (importOrderId: string): Promise<ResponseDTO<ImportOrderResponse>> => {
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

  const extendImportOrder = async (requestData: ExtendImportOrderRequest): Promise<ResponseDTO<ImportOrderResponse>> => {
    try {
      const response = await callApi("post", "/import-order/extend", requestData);
      if (response && response.content) {
        toast.success("Gia hạn đơn nhập thành công");
      }
      return response;
    } catch (error) {
      toast.error("Không thể gia hạn đơn nhập");
      console.error("Error extending import order:", error);
      throw error;
    }
  };

  return {
    loading,
    importOrderId,
    getAllImportOrders,
    getAllImportOrdersByImportRequestId,
    getImportOrderById,
    createImportOrder,
    assignStaff,
    completeImportOrder,
    cancelImportOrder,
    extendImportOrder,
  };
};

export default useImportOrderService;
