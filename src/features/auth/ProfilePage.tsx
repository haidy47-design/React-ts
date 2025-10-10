import React from "react";
import HelmetWrapper from "../../components/common/HelmetWrapper";
import { useAppSelector } from "../hooks";

export default function ProfilePage(): React.ReactElement {
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  return (
    <div className="container py-4">
      <HelmetWrapper title="Profile" />
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h4 className="mb-3">Profile</h4>
              <p className="mb-1"><strong>Name:</strong> {user?.name ?? "—"}</p>
              <p className="mb-1"><strong>Email:</strong> {user?.email ?? "—"}</p>
              <p className="text-muted small">Token: {token ? token.slice(0, 16) + "…" : "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


