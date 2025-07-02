import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/auth";
import { FileText, Image, Eye, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

interface MedicalRecord {
  id: number;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  previewUrl: string;
}

export default function MedicalRecords() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recordsData, isLoading } = useQuery({
    queryKey: ["/api/medical-records"],
    queryFn: async () => {
      const response = await fetch("/api/medical-records", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch records");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (recordId: number) => {
      const response = await fetch(`/api/medical-records/${recordId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete record");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Record deleted",
        description: "Medical record has been successfully removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records"] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete record.",
        variant: "destructive",
      });
    },
  });

  const handlePreview = (record: MedicalRecord) => {
    window.open(record.previewUrl, "_blank");
  };

  const handleDelete = (recordId: number) => {
    deleteMutation.mutate(recordId);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <FileText className="w-6 h-6 text-secondary" />;
    }
    return <Image className="w-6 h-6 text-secondary" />;
  };

  const records = recordsData?.records || [];

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-accent rounded w-64 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-accent rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-bold text-foreground">Recent Medical Records</h3>
          {records.length > 3 && (
            <Button variant="outline" className="text-secondary border-secondary hover:bg-secondary hover:text-white">
              View All
            </Button>
          )}
        </div>

        {records.length === 0 ? (
          <Card className="card-shadow">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2">No medical records yet</h4>
              <p className="text-muted-foreground">Upload your first medical document to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {records.slice(0, 5).map((record: MedicalRecord) => (
              <Card key={record.id} className="bg-background card-shadow hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                        {getFileIcon(record.fileType)}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{record.originalName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Uploaded {formatDistanceToNow(new Date(record.uploadedAt), { addSuffix: true })} • {formatFileSize(record.fileSize)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(record)}
                        className="hover:bg-accent"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-accent">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePreview(record)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(record.id)}
                            className="text-destructive"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
