import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/auth";
import { FileText, Image, Eye, MoreVertical, Trash2, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import Header from "@/components/Header";
import { useState, useRef } from "react";
import { Progress } from "@/components/ui/progress";

interface MedicalRecord {
  id: number;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  previewUrl: string;
}

export default function MedicalRecordsPage() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 201) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(JSON.parse(xhr.responseText).message || "Upload failed"));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open("POST", "/api/medical-records");
        xhr.setRequestHeader("Authorization", `Bearer ${getToken()}`);
        xhr.send(formData);
      });
    },
    onSuccess: () => {
      toast({
        title: "Upload successful!",
        description: "Your medical record has been securely uploaded.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records"] });
      setUploadProgress(0);
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      setUploadProgress(0);
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

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only PDF and JPG files are allowed.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Medical Records</h1>
          <p className="text-muted-foreground">Securely manage and organize your medical documents</p>
        </div>

        {/* Upload Section */}
        <Card className="card-shadow mb-8">
          <CardContent className="p-8">
            <div
              className={`upload-area rounded-xl p-12 text-center mb-6 cursor-pointer transition-all ${
                isDragging ? "border-secondary bg-accent" : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleButtonClick}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-secondary" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">Drop files here or click to browse</h4>
                <p className="text-muted-foreground mb-4">Support for PDF and JPG files up to 5MB each</p>
                <Button 
                  className="bg-secondary text-white hover:bg-secondary/90"
                  disabled={uploadMutation.isPending}
                >
                  Choose Files
                </Button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            {uploadMutation.isPending && (
              <div className="bg-accent/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Uploading...</span>
                  <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Records List */}
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-accent rounded-xl"></div>
            ))}
          </div>
        ) : records.length === 0 ? (
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
            {records.map((record: MedicalRecord) => (
              <Card key={record.id} className="bg-white card-shadow hover:shadow-lg transition-shadow">
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
    </div>
  );
}