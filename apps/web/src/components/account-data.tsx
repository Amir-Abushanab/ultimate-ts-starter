import { useNavigate } from "@tanstack/react-router";
import { Button } from "@ultimate-ts-starter/ui/components/button";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { client } from "@/utils/orpc";

const AccountData = () => {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await client.account.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `account-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported");
    } catch {
      toast.error("Failed to export data");
    }
    setExporting(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await client.account.deleteAccount();
      void authClient.signOut();
      void navigate({ to: "/" });
      toast.success("Account deleted");
    } catch {
      toast.error("Failed to delete account");
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Your Data</h3>
        <p className="text-sm text-muted-foreground">
          Download a copy of all your data or permanently delete your account.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          disabled={exporting}
          onClick={() => {
            void handleExport();
          }}
        >
          {exporting ? "Exporting..." : "Export my data"}
        </Button>

        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() => {
                void handleDelete();
              }}
            >
              {deleting ? "Deleting..." : "Yes, permanently delete"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setConfirmDelete(false);
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="destructive"
            onClick={() => {
              setConfirmDelete(true);
            }}
          >
            Delete my account
          </Button>
        )}
      </div>

      {confirmDelete && (
        <p className="text-sm text-destructive">
          This action is irreversible. All your data, sessions, and linked
          accounts will be permanently removed.
        </p>
      )}
    </div>
  );
};

export default AccountData;
