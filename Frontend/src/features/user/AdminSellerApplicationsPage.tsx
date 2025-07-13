// src/features/admin/AdminSellerApplicationsPage.tsx

import React, { useEffect, useState } from "react";
import api from "@/api/apiService";
import { Button } from "@/common/ui/button";
import { Card, CardContent } from "@/common/ui/card";
import { toast } from "sonner";
import { SellerApplicationStatus, type SellerApplication } from "@/types/sellerApplication";
import DefaultHeader from "@/common/components/DefaultHeader";
import { hasAllowedRole } from "@/utils/roles";
import { useAppSelector } from "@/store/hooks/hooks";

const AdminSellerApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<number | null>(null);
  const currentUser = useAppSelector((state) => state.auth.user);

  const fetchApplications = async () => {
    try {
      const response = await api.get("/api/seller-applications/");
      const sorted = response.data.sort(
        (a: SellerApplication, b: SellerApplication) =>
          new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
      );
      setApplications(sorted);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load seller applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    setActioningId(id);
    try {
      await api.post(`/api/seller-applications/${id}/${action}/`);
      toast.success(`Application ${action}d`);
      fetchApplications(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${action} application.`);
    } finally {
      setActioningId(null);
    }
  };

  if (loading) return <p className="text-center mt-6">Loading applications...</p>;

  return (
    <>
      <DefaultHeader />
      <div className="max-w-4xl mx-auto mt-6 space-y-4">
        <h2 className="text-2xl font-bold mb-4">Seller Applications</h2>

        {applications.length === 0 && <p>No applications yet.</p>}

        {applications.map((app) => (
          <Card key={app.id}>
            <CardContent className="space-y-2 p-4">
              <div>
                <strong>User:</strong>{" "}
                {app.user?.username ?? "Unknown"}
              </div>
              <div>
                <strong>Status:</strong> {app.status}
              </div>
              <div>
                <strong>Submitted:</strong>{" "}
                {new Date(app.submitted_at).toLocaleString()}
              </div>
              {app.reviewed_at && (
                <div>
                  <strong>Reviewed At:</strong>{" "}
                  {new Date(app.reviewed_at).toLocaleString()}
                </div>
              )}
              {app.reviewer && (
                <div>
                  <strong>Reviewed By:</strong> {app.reviewer.username}
                </div>
              )}
              <div>
                <strong>Business Name:</strong> {app.business_name}
              </div>
              <div>
                <strong>Tax ID:</strong> {app.tax_id}
              </div>
              {app.phone_number && (
                <div>
                  <strong>Phone Number:</strong> {app.phone_number}
                </div>
              )}
              {app.country && (
                <div>
                  <strong>Country:</strong> {app.country}
                </div>
              )}
              {app.description && (
                <div>
                  <strong>Description:</strong> {app.description}
                </div>
              )}

              {app.status === SellerApplicationStatus.PENDING &&
              currentUser?.groups && hasAllowedRole(currentUser.groups) && ( 
                <div className="flex gap-4 mt-2">
                  <Button
                    variant="success"
                    disabled={actioningId === app.id}
                    onClick={() => handleAction(app.id, "approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={actioningId === app.id}
                    onClick={() => handleAction(app.id, "reject")}
                  >
                    Reject
                  </Button>
                </div>
            )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default AdminSellerApplicationsPage;
