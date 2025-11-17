import React, { useState } from "react";
import type { CustomerFormData } from "@/types/customer";

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => void;
  isLoading?: boolean;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    phone: "",
    name: "",
    dob: "",
    customerTypeId: 1, // Default customer type
  });

  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerFormData> = {};

    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Validate DOB
    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const selectedDate = new Date(formData.dob);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.dob = "Date of birth cannot be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (
    field: keyof CustomerFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      // Reset form
      setFormData({
        phone: "",
        name: "",
        dob: "",
        customerTypeId: 1,
      });
      setErrors({});
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out"
      style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
    >
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,0.15)] backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="bg-white rounded-2xl w-[400px] max-w-[90%] shadow-xl overflow-hidden relative z-10  customer-modal">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] p-4 text-white rounded-t-2xl">
          <div className="text-xl font-bold">Customer Information</div>
          <div className="text-sm font-normal">
            Please enter customer details
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Phone Number */}
          <div className="mb-4">
            <label className="block font-semibold mb-2 text-sm">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                handleChange(
                  "phone",
                  e.target.value.replace(/\D/g, "").slice(0, 10)
                )
              }
              placeholder="Enter 10-digit phone number"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.phone
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-[#6A1B9A]"
              }`}
              disabled={isLoading}
              maxLength={10}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block font-semibold mb-2 text-sm">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter customer name"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-[#6A1B9A]"
              }`}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="mb-4">
            <label className="block font-semibold mb-2 text-sm">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => handleChange("dob", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.dob
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-[#6A1B9A]"
              }`}
              disabled={isLoading}
            />
            {errors.dob && (
              <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
            )}
          </div>

          {/* Customer Type */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-sm">
              Customer Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.customerTypeId}
              onChange={(e) =>
                handleChange("customerTypeId", parseInt(e.target.value))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6A1B9A]"
              disabled={isLoading}
            >
              <option value={1}>Regular</option>
              <option value={2}>VIP</option>
              <option value={3}>Member</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 py-3 rounded-lg text-base font-semibold text-[#6A1B9A] bg-gray-100 hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="create-customer-btn flex-1 py-3 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
