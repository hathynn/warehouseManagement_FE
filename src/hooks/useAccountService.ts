import { AccountRole, AccountRoleForRequest } from "@/utils/enums";
import useApiService from "./useApi";
import { toast } from "react-toastify";

// Interface to match AccountResponse.java
export interface AccountResponse {
  id: number;
  email: string;
  phone: string;
  fullName: string;
  status: string;
  isEnable: boolean;
  isBlocked: boolean;
  role: AccountRole;
  importOrderIds: number[];
  exportRequestIds: number[];
  totalActualWorkingTimeOfRequestInDay: string;
  totalExpectedWorkingTimeOfRequestInDay: string;
}

// Interface to match RegisterRequest.java
export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

// Interface to match RegisterResponse.java
export interface RegisterResponse {
  id: number;
  email: string;
  phone: string;
  fullName: string;
  role: AccountRole;
  status: string;
  isEnable: boolean;
  isBlocked: boolean;
}

// Interface to match AuthenticationRequest.java
export interface AuthenticationRequest {
  email: string;
  password: string;
}

// Interface to match AuthenticationResponse.java
export interface AuthenticationResponse {
  access_token: string;
  refresh_token: string;
}

// Interface to match ActiveAccountRequest.java
export interface ActiveAccountRequest {
  date: string; // ISO date string, e.g. '2025-05-03'
  importOrderId?: string;
  exportRequestId?: string;
}


const useAccountService = () => {
  const { callApi, loading } = useApiService();

  /**
   * Register a new account
   * @param request - The registration request data
   * @returns Promise resolving to RegisterResponse
   */
  const register = async (
    request: RegisterRequest
  ): Promise<RegisterResponse> => {
    try {
      const response = await callApi("post", "/account/register", request);
      if (response && response.content) {
        toast.success("Đăng ký tài khoản thành công");
        return response.content;
      }
      throw new Error("Registration failed");
    } catch (error) {
      toast.error("Đăng ký tài khoản thất bại");
      console.error("Error registering account:", error);
      throw error;
    }
  };

  /**
   * Authenticate user
   * @param request - The authentication request data
   * @returns Promise resolving to AuthenticationResponse
   */
  const login = async (
    request: AuthenticationRequest
  ): Promise<AuthenticationResponse> => {
    try {
      const response = await callApi("post", "/account/login", request);
      if (response && response.content) {
        toast.success("Đăng nhập thành công");
        return response.content;
      }
      throw new Error("Authentication failed");
    } catch (error) {
      toast.error("Đăng nhập thất bại");
      console.error("Error authenticating:", error);
      throw error;
    }
  };

  /**
   * Refresh the access token
   * @returns Promise resolving to AuthenticationResponse
   */
  const refreshToken = async (): Promise<AuthenticationResponse> => {
    try {
      const response = await callApi("post", "/account/refresh-token");
      if (response && response.content) {
        return response.content;
      }
      throw new Error("Token refresh failed");
    } catch (error) {
      toast.error("Làm mới token thất bại");
      console.error("Error refreshing token:", error);
      throw error;
    }
  };

  /**
   * Get accounts by role
   * @param role - The role to filter accounts by
   * @returns Promise resolving to an array of AccountResponse objects
   */
  const getAccountsByRole = async (
    role: AccountRoleForRequest
  ): Promise<AccountResponse[]> => {
    try {
      const response = await callApi("get", `/account/role/${role}`);
      if (response && response.content) {
        return response.content;
      }
      return [];
    } catch (error) {
      toast.error("Không thể lấy danh sách tài khoản theo vai trò");
      console.error("Error fetching accounts by role:", error);
      throw error;
    }
  };

  /**
   * Get all active staff accounts
   * @returns Promise resolving to an array of AccountResponse objects
   */
  const getActiveStaff = async (): Promise<AccountResponse[]> => {
    try {
      const response = await callApi("get", `/account/active-staff`);
      if (response && response.content) {
        return response.content;
      }
      return [];
    } catch (error) {
      toast.error("Không thể lấy danh sách nhân viên đang hoạt động");
      console.error("Error fetching active staff:", error);
      throw error;
    }
  };

  /**
   * Get all active staff accounts for a specific date
   * @param request - The request object containing date (and optionally importOrderId/exportRequestId)
   * @returns Promise resolving to an array of AccountResponse objects
   */
  const getActiveStaffsInDay = async (
    request: ActiveAccountRequest
  ): Promise<AccountResponse[]> => {
    try {
      const response = await callApi(
        "post",
        "/account/active-staff-in-day",
        request
      );
      if (response && response.content) {
        return response.content;
      }
      return [];
    } catch (error) {
      toast.error(
        "Không thể lấy danh sách nhân viên đang hoạt động trong ngày"
      );
      console.error("Error fetching active staff for date:", error);
      throw error;
    }
  };

  /**
   * Find account by email
   * @param email - The email to search for
   * @returns Promise resolving to AccountResponse
   */
  const findAccountByEmail = async (
    email: string
  ): Promise<AccountResponse> => {
    try {
      const response = await callApi("get", `/account/by-email?email=${email}`);
      if (response && response.content) {
        return response.content;
      }
      throw new Error("Account not found");
    } catch (error) {
      toast.error("Không thể tìm thấy tài khoản");
      console.error("Error finding account by email:", error);
      throw error;
    }
  };

  /**
   * Find account by id
   * @param id - The id to search for
   * @returns Promise resolving to AccountResponse
   */
  const findAccountById = async (id: number): Promise<AccountResponse> => {
    try {
      const response = await callApi("get", `/account/by-id?id=${id}`);
      if (response && response.content) {
        return response.content;
      }
      throw new Error("Account not found");
    } catch (error) {
      toast.error("Không thể tìm thấy tài khoản");
      console.error("Error finding account by id:", error);
      throw error;
    }
  };

  return {
    loading,
    register,
    login,
    refreshToken,
    getAccountsByRole,
    getActiveStaff,
    getActiveStaffsInDay,
    findAccountByEmail,
    findAccountById,
  };
};

export default useAccountService;
