import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/apiService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName || !taxId || !country) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/seller-applications/", {
        business_name: businessName,
        tax_id: taxId,
        phone_number: phoneNumber,
        description,
        website,
        country,
        bank_account_number: bankAccountNumber,
        bank_name: bankName,
        bank_swift_code: bankSwiftCode,
        national_id: nationalId,
      });

      toast.success("Application submitted! Awaiting admin approval.");
      navigate("/marketplace");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit seller application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4 mt-6">
      <h2 className="text-xl font-bold">Become a Seller</h2>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Business Name *</span>
        <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Tax ID / Business ID *</span>
        <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} required />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Phone Number</span>
        <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Business Description</span>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Website</span>
        <Input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Country *</span>
        <Input value={country} onChange={(e) => setCountry(e.target.value)} required />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Bank Account Number</span>
        <Input value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Bank Name</span>
        <Input value={bankName} onChange={(e) => setBankName(e.target.value)} />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Bank SWIFT Code</span>
        <Input value={bankSwiftCode} onChange={(e) => setBankSwiftCode(e.target.value)} />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">National ID / Passport Number</span>
        <Input value={nationalId} onChange={(e) => setNationalId(e.target.value)} />
      </label>

      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
};

export default BecomeSellerForm;
