import type { UserData } from "./auth";
import type { ApiResponse } from "./index";
import type { ApiAddress, AddAddressRequest } from "./address";

/**
 * Trạng thái của Seller (dựa trên trường accountStatus)
 * API mẫu dùng "ACTIVE", khớp với logic
 */
export type SellerStatus = "ACTIVE" | "PENDING" | "REJECTED" | "SUSPENDED";

/**
 * Chi tiết doanh nghiệp (businessDetails)
 */
export interface SellerBusinessDetails {
  businessName: string;
  businessEmail: string;
  businessMobile: string;
  businessAddress: string;
  logo: string | null;
  banner: string | null;
}

/**
 * Chi tiết ngân hàng (bankDetails)
 */
export interface SellerBankDetails {
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  ifscCode: string;
}

/**
 * Dữ liệu chi tiết của Seller trả về từ API (dựa trên response mẫu)
 * SỬA LỖI: Loại bỏ 'id' ở cấp gốc vì nó không tồn tại trong response.
 * Chúng ta sẽ dùng 'user.id' làm ID định danh.
 */
export interface ApiSellerData {
  user: UserData;
  avatar: string | null;
  businessDetails: SellerBusinessDetails;
  bankDetails: SellerBankDetails;
  pickupAddress: ApiAddress;
  gstin: string;
  isEmailVerified: boolean;
  accountStatus: SellerStatus;
}

/**
 * Dữ liệu trả về cho API lấy danh sách seller (phân trang)
 */
export interface SellerPageData {
  pageContent: ApiSellerData[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export type GetSellersResponse = ApiResponse<SellerPageData>;

/**
 * Dữ liệu gửi đi khi cập nhật trạng thái seller
 */
export interface UpdateSellerStatusRequest {
  status: SellerStatus;
  reason?: string;
}

export type UpdateSellerStatusResponse = ApiResponse<ApiSellerData>;

/**
 * Dữ liệu cho Business Details trong request đăng ký
 */
export interface SellerBusinessDetailsRequest {
  businessName: string;
  businessEmail: string;
  businessMobile: string;
  businessAddress: string;
  logo: string;
  banner: string;
}

/**
 * Dữ liệu cho Bank Details trong request đăng ký
 */
export interface SellerBankDetailsRequest {
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  ifscCode: string;
}

/**
 * Toàn bộ request body để đăng ký seller
 */
export interface SellerRegistrationRequest {
  businessDetails: SellerBusinessDetailsRequest;
  bankDetails: SellerBankDetailsRequest;
  pickupAddress: AddAddressRequest;
  gstin: string;
}

/**
 * Kiểu dữ liệu trả về khi đăng ký seller thành công
 * (Giả định trả về ApiSellerData)
 */
export type SellerRegistrationResponse = ApiResponse<ApiSellerData>;
