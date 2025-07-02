import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/auth";
import { Lightbulb, Heart, BookOpen } from "lucide-react";

const moodEmojis = [
  { value: 1, emoji: "😢", label: "Sad" },
  { value: 2, emoji: "😐", label: "Okay" },
  { value: 3, emoji: "😊", label: "Good" },
  { value: 4, emoji: "😄", label: "Great" },
  { value: 5, emoji: "🤩", label: "Amazing" },
];

export default function WellnessSection() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: healthTip } = useQuery({
    queryKey: ["/api/health-tips"],
    queryFn: async () => {
      const response = await fetch("/api/health-tips");
      if (!response.ok) throw new Error("Failed to fetch health tip");
      return response.json();
    },
  });

  const { data: wellnessData } = useQuery({
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

  const moodMutation = useMutation({
    mutationFn: async (mood: number) => {
      const response = await fetch("/api/wellness", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ mood }),
      });
      if (!response.ok) throw new Error("Failed to record mood");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mood recorded!",
        description: "Your mood has been successfully logged.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wellness"] });
      setSelectedMood(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to record mood",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMoodSelect = (mood: number) => {
    setSelectedMood(mood);
    moodMutation.mutate(mood);
  };

  const wellnessStreak = wellnessData?.entries?.length || 0;

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">Your Wellness Journey</h3>
          <p className="text-lg text-muted-foreground">Personalized health insights and wellness resources to support your overall well-being</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Daily Health Tip */}
          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-foreground">Daily Health Tip</h4>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200" 
                alt="Woman practicing wellness lifestyle with healthy food and exercise" 
                className="rounded-lg w-full h-32 object-cover mb-4"
              />
              {healthTip ? (
                <>
                  <h5 className="font-medium text-foreground mb-2">{healthTip.tip.title}</h5>
                  <p className="text-muted-foreground mb-4 text-sm">{healthTip.tip.content}</p>
                  <span className="inline-block bg-accent px-2 py-1 rounded text-xs text-secondary font-medium">
                    {healthTip.tip.category}
                  </span>
                </>
              ) : (
                <div className="animate-pulse">
                  <div className="h-4 bg-accent rounded mb-2"></div>
                  <div className="h-3 bg-accent rounded mb-4"></div>
                  <div className="h-6 bg-accent rounded w-16"></div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mood Tracking */}
          <Card className="wellness-card text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold">How are you feeling today?</h4>
              </div>
              
              <div className="grid grid-cols-5 gap-2 mb-4">
                {moodEmojis.map((mood) => (
                  <Button
                    key={mood.value}
                    variant="ghost"
                    size="sm"
                    className={`p-3 bg-white/20 hover:bg-white/30 text-center flex-col h-auto ${
                      selectedMood === mood.value ? "bg-white/40" : ""
                    }`}
                    onClick={() => handleMoodSelect(mood.value)}
                    disabled={moodMutation.isPending}
                  >
                    <div className="text-2xl mb-1">{mood.emoji}</div>
                    <div className="text-xs text-white">{mood.label}</div>
                  </Button>
                ))}
              </div>
              
              <p className="text-white/80 text-sm">
                {wellnessStreak > 0 
                  ? `${wellnessStreak}-day streak! Keep tracking your mood to identify patterns and improve your mental wellness.`
                  : "Start tracking your mood to identify patterns and improve your mental wellness."
                }
              </p>
            </CardContent>
          </Card>

          {/* Wellness Resources */}
          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-secondary" />
                </div>
                <h4 className="font-semibold text-foreground">Wellness Resources</h4>
              </div>
              
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200" 
                alt="Healthcare dashboard interface showing wellness tracking" 
                className="rounded-lg w-full h-32 object-cover mb-4"
              />
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="text-sm text-foreground">Women's Health Guide</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="text-sm text-foreground">Meditation & Mindfulness</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="text-sm text-foreground">Nutrition Planning</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="text-sm text-foreground">Exercise Programs</span>
                </div>
              </div>
              
              <Button variant="ghost" className="mt-4 text-secondary hover:text-secondary/80 p-0">
                Explore All Resources
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
