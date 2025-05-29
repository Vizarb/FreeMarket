// src/features/admin/AdminSellerApplicationsPage.tsx

import React, { useEffect, useState } from "react";
import api from "@/api/apiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface SellerApplication {
  id: number;
  user: { id: number; username: string };
  data: any;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewer?: { id: number; username: string };
}

const AdminSellerApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const response = await api.get("/api/seller-applications/");
      setApplications(response.data);
    } catch (error) {
      toast.error("Failed to load seller applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      await api.post(`/api/seller-applications/${id}/${action}/`);
      toast.success(`Application ${action}d`);
      fetchApplications(); // Refresh list
    } catch (error) {
      toast.error(`Failed to ${action} application.`);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Seller Applications</h2>

      {applications.length === 0 && <p>No applications yet.</p>}

      {applications.map((app) => (
        <Card key={app.id}>
          <CardContent className="space-y-2 p-4">
            <div>
              <strong>User:</strong> {app.user.username} (ID: {app.user.id})
            </div>
            <div>
              <strong>Status:</strong> {app.status}
            </div>
            <div>
              <strong>Submitted:</strong> {new Date(app.submitted_at).toLocaleString()}
            </div>
            {app.reviewed_at && (
              <div>
                <strong>Reviewed At:</strong> {new Date(app.reviewed_at).toLocaleString()}
              </div>
            )}
            {app.reviewer && (
              <div>
                <strong>Reviewed By:</strong> {app.reviewer.username}
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              <pre>{JSON.stringify(app.data, null, 2)}</pre>
            </div>

            {app.status === "PENDING" && (
              <div className="flex gap-4 mt-2">
                <Button variant="success" onClick={() => handleAction(app.id, "approve")}>
                  Approve
                </Button>
                <Button variant="destructive" onClick={() => handleAction(app.id, "reject")}>
                  Reject
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminSellerApplicationsPage;
