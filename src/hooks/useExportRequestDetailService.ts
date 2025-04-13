import { message } from "antd";
import useApiService from "./useApi";
import { toast } from "react-toastify";

// Interface mô tả dữ liệu chi tiết của export request trả về từ API
export interface ExportRequestDetailResponse {
  importRequestDetailId: number;
  exportRequestId: number;
  exportRequestDetailId: number;
  itemId: number;
  quantity: number;
  status: string;
  itemName: string; // Dùng để hiển thị tên hàng trên UI
}

// Interface dùng cho payload khi tạo mới export request detail (nếu cần)
export interface ExportRequestDetailRequest {
  exportRequestId: number;
  itemId: number;
  quantity: number;
  status: string;
  itemName: string;
}

const useExportRequestDetailService = () => {
  const { callApi, loading } = useApiService();

  /**
   * Upload file Excel để tạo mới export request detail.
   * @param file - Đối tượng File của file Excel
   * @param exportRequestId - Mã phiếu xuất đã được tạo thành công từ API
   * @returns Dữ liệu từ phản hồi của API nếu upload thành công
   */
  const createExportRequestDetail = async (
    formDataFile: FormData,
    exportRequestId: number
  ): Promise<ExportRequestDetailResponse | undefined> => {
    try {
      const response = await callApi(
        "post",
        `/export-request-detail/${exportRequestId}`,
        formDataFile
      );
      if (response && response.content) {
        toast.success("Tạo chi tiết phiếu xuất thành công");
        return response.content;
      }
    } catch (error) {
      if (error.message.inludes("Inventory items not found for item ID")) {
        toast.error("Không tìm thấy hàng hóa trong kho");
      }
      console.error("Error creating export request detail:", error);
      throw error;
    }
  };

  /**
   * Lấy danh sách export request detail theo exportRequestId (có phân trang).
   * @param exportRequestId - Mã phiếu xuất cần lấy chi tiết
   * @param page - Số trang (mặc định 1)
   * @param limit - Số mục trên 1 trang (mặc định 10)
   * @returns Đối tượng chứa mảng ExportRequestDetailResponse và metadata phân trang
   */
  const getExportRequestDetails = async (
    exportRequestId: number,
    page = 1,
    limit = 10
  ): Promise<{
    content: ExportRequestDetailResponse[];
    metaDataDTO: { page: number; limit: number; total: number } | null;
  }> => {
    try {
      const response = await callApi(
        "get",
        `/export-request-detail/${exportRequestId}?page=${page}&limit=${limit}`
      );
      if (response && response.content) {
        return response;
      }
      return {
        content: [],
        metaDataDTO: null,
      };
    } catch (error) {
      toast.error("Không thể lấy danh sách chi tiết phiếu xuất");
      console.error("Error fetching export request details:", error);
      throw error;
    }
  };

  return {
    loading,
    createExportRequestDetail,
    getExportRequestDetails,
  };
};

export default useExportRequestDetailService;
