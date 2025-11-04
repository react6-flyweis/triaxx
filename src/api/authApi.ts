import api from "@/api/axios";

export interface SendOtpResponse {
  success: boolean;
  message?: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
}

export async function sendOtp(email: string): Promise<SendOtpResponse> {
  try {
    const { data } = await api.post("/api/user/forget-password/send-otp", {
      email,
    });
    return data;
  } catch (error: unknown) {
    // normalize error
    const err = error as Error & { response?: { data?: { message?: string } } };
    const message =
      err.response?.data?.message ||
      (err instanceof Error ? err.message : "Failed to send OTP");
    throw new Error(message);
  }
}
