import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/apiService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SellerApplication } from "@/types/sellerApplication";
import DefaultHeader from "../common/DefaultHeader";

const BecomeSellerForm: React.FC = () => {
  const [businessName, setBusinessName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankSwiftCode, setBankSwiftCode] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-redirect if active application exists
  useEffect(() => {
    const checkExistingApplication = async () => {
      try {
        const res = await api.get("/api/seller-applications/");
        const hasActive = res.data.some(
          (app: SellerApplication) => app.status === "pending" || app.status === "approved"
        );

        if (hasActive) {
          toast.info("You already have an active seller application.");
          navigate("/admin/seller-applications");
        }
      } catch (err) {
        console.error("Failed to check existing applications", err);
      }
    };

    checkExistingApplication();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Prevent double-submit
    if (loading) return;

    const alphanumericPattern = /^[A-Za-z0-9]{9,15}$/;
    const phonePattern = /^\+?[1-9]\d{1,14}$/;
    const swiftPattern = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

    // Basic validations
    if (!businessName.trim() || !taxId.trim() || !country.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (businessName.length > 255) {
      toast.error("Business name must be at most 255 characters.");
      return;
    }

    if (!alphanumericPattern.test(taxId)) {
      toast.error("Tax ID must be alphanumeric and 9–15 characters long.");
      return;
    }

    if (phoneNumber && !phonePattern.test(phoneNumber)) {
      toast.error("Phone number must be in format: '+123456789' (up to 15 digits).");
      return;
    }

    if (bankSwiftCode && !swiftPattern.test(bankSwiftCode)) {
      toast.error("SWIFT code must be 8 or 11 uppercase letters/numbers.");
      return;
    }

    if (nationalId && !alphanumericPattern.test(nationalId)) {
      toast.error("National ID must be alphanumeric and 9–15 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.get("/api/seller-applications/");
      const hasActive = res.data.some(
        (app: SellerApplication) => app.status === "pending" || app.status === "approved"
      );

      if (hasActive) {
        navigate("/admin/seller-applications");
        toast.error("You already have an active seller application.");
        return;
      }

      const payload = {
        business_name: businessName.trim(),
        tax_id: taxId.trim(),
        phone_number: phoneNumber.trim() || null,
        description,
        website: website.trim() || null,
        country: country.trim(),
        bank_account_number: bankAccountNumber.trim() || null,
        bank_name: bankName.trim() || null,
        bank_swift_code: bankSwiftCode.trim() || null,
        national_id: nationalId.trim() || null,
      };

      toast.promise(api.post("/api/seller-applications/", payload), {
        loading: "Submitting your application...",
        success: () => {
          navigate("/admin/seller-applications");
          return "Application submitted successfully!";
        },
        error: (err) => {
          const detail = err?.response?.data?.detail ||
            Object.values(err?.response?.data || {})?.[0] ||
            "Failed to submit application.";
          return `Error: ${detail}`;
        },
      });
    } catch (err) {
      console.error("Unexpected error", err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <DefaultHeader/>
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4 mt-6">
      <h2 className="text-xl font-bold">Become a Seller</h2>

      <FormGroup label="Business Name *" value={businessName} setValue={setBusinessName} required />
      <FormGroup label="Tax ID / Business ID *" value={taxId} setValue={setTaxId} required />
      <FormGroup label="Phone Number" value={phoneNumber} setValue={setPhoneNumber} />
      <FormGroup label="Business Description" value={description} setValue={setDescription} textarea />
      <FormGroup label="Website" value={website} setValue={setWebsite} type="url" />
      <FormGroup label="Country *" value={country} setValue={setCountry} required />
      <FormGroup label="Bank Account Number" value={bankAccountNumber} setValue={setBankAccountNumber} />
      <FormGroup label="Bank Name" value={bankName} setValue={setBankName} />
      <FormGroup label="Bank SWIFT Code" value={bankSwiftCode} setValue={setBankSwiftCode} />
      <FormGroup label="National ID / Passport Number" value={nationalId} setValue={setNationalId} />

      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  </>);
};

export default BecomeSellerForm;

// Small reusable form group component
type FormGroupProps = {
  label: string;
  value: string;
  setValue: (val: string) => void;
  textarea?: boolean;
  required?: boolean;
  type?: string;
};

const FormGroup: React.FC<FormGroupProps> = ({
  label,
  value,
  setValue,
  textarea = false,
  required = false,
  type = "text",
}) => {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      {textarea ? (
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required={required}
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required={required}
        />
      )}
    </label>
  );
};

