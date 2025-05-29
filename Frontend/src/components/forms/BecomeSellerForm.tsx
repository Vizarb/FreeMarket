// src/features/seller/BecomeSellerForm.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/apiService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BecomeSellerFormProps {
  prefilledPhone?: string;
}

const BecomeSellerForm: React.FC<BecomeSellerFormProps> = ({ prefilledPhone }) => {
  const [businessName, setBusinessName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [description, setDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(prefilledPhone || "");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName || !taxId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/seller-applications/", {
        data: {
          businessName,
          taxId,
          description,
          phoneNumber,
        },
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

      <label className="block">
        <span className="text-sm font-medium">Business Name *</span>
        <Input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Tax ID / Business ID *</span>
        <Input
          value={taxId}
          onChange={(e) => setTaxId(e.target.value)}
          required
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Phone Number</span>
        <Input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Description (optional)</span>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
};

export default BecomeSellerForm;
