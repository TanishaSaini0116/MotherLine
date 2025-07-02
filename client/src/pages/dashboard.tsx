import Header from "@/components/Header";
import FileUpload from "@/components/FileUpload";
import MedicalRecords from "@/components/MedicalRecords";
import WellnessSection from "@/components/WellnessSection";
import { useQuery } from "@tanstack/react-query";
import { getToken } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Shield, Heart, Zap } from "lucide-react";

export default function Dashboard() {
  const { data: userRecords } = useQuery({
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

  const { data: wellnessEntries } = useQuery({
    queryKey: ["/api/wellness"],
    queryFn: async () => {
      const response = await fetch("/api/wellness", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch wellness entries");
      return response.json();
    },
  });

  const recordCount = userRecords?.records?.length || 0;
  const wellnessScore = wellnessEntries?.entries?.length > 0 
    ? Math.round((wellnessEntries.entries.reduce((acc: number, entry: any) => acc + entry.mood, 0) / wellnessEntries.entries.length) * 20)
    : 0;
  const dayStreak = wellnessEntries?.entries?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-gradient py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Your Health, <span className="text-secondary">Secured</span> & Organized
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Securely manage your medical records, track your wellness journey, and take control of your health with our comprehensive digital platform designed specifically for women.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
                alt="Women using healthcare technology" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl card-shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Records Secured</p>
                    <p className="text-sm text-muted-foreground">{recordCount} files protected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-accent/30 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">{recordCount}</h3>
                <p className="text-muted-foreground">Medical Records</p>
              </CardContent>
            </Card>

            <Card className="bg-accent/30 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">100%</h3>
                <p className="text-muted-foreground">Secure Storage</p>
              </CardContent>
            </Card>

            <Card className="bg-accent/30 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">{wellnessScore}%</h3>
                <p className="text-muted-foreground">Wellness Score</p>
              </CardContent>
            </Card>

            <Card className="bg-accent/30 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">{dayStreak}</h3>
                <p className="text-muted-foreground">Day Streak</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <FileUpload />
      <MedicalRecords />
      <WellnessSection />
    </div>
  );
}
