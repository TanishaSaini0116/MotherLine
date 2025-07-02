import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/auth";
import { Lightbulb, Heart, BookOpen, TrendingUp, Calendar, Smile } from "lucide-react";
import Header from "@/components/Header";
import { formatDistanceToNow } from "date-fns";

const moodEmojis = [
  { value: 1, emoji: "😢", label: "Sad", color: "bg-red-100 text-red-600" },
  { value: 2, emoji: "😐", label: "Okay", color: "bg-orange-100 text-orange-600" },
  { value: 3, emoji: "😊", label: "Good", color: "bg-yellow-100 text-yellow-600" },
  { value: 4, emoji: "😄", label: "Great", color: "bg-green-100 text-green-600" },
  { value: 5, emoji: "🤩", label: "Amazing", color: "bg-blue-100 text-blue-600" },
];

interface WellnessEntry {
  id: number;
  mood: number;
  notes: string | null;
  createdAt: string;
}

export default function WellnessPage() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
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

  const { data: wellnessData, isLoading } = useQuery({
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
    mutationFn: async ({ mood, notes }: { mood: number; notes?: string }) => {
      const response = await fetch("/api/wellness", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ mood, notes: notes || null }),
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
      setNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to record mood",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMoodSubmit = () => {
    if (selectedMood) {
      moodMutation.mutate({ mood: selectedMood, notes });
    }
  };

  const entries = wellnessData?.entries || [];
  const wellnessStreak = entries.length;
  const averageMood = entries.length > 0 
    ? Math.round((entries.reduce((acc: number, entry: WellnessEntry) => acc + entry.mood, 0) / entries.length) * 20)
    : 0;

  const getMoodEmoji = (mood: number) => {
    const moodData = moodEmojis.find(m => m.value === mood);
    return moodData ? moodData.emoji : "😊";
  };

  const getMoodLabel = (mood: number) => {
    const moodData = moodEmojis.find(m => m.value === mood);
    return moodData ? moodData.label : "Good";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Wellness Dashboard</h1>
          <p className="text-muted-foreground">Track your mood, discover health tips, and monitor your wellness journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary to-secondary text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Wellness Score</p>
                  <h3 className="text-3xl font-bold">{averageMood}%</h3>
                </div>
                <TrendingUp className="w-8 h-8 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Tracking Streak</p>
                  <h3 className="text-3xl font-bold text-foreground">{wellnessStreak}</h3>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Today's Mood</p>
                  <h3 className="text-3xl font-bold text-foreground">
                    {entries.length > 0 ? getMoodEmoji(entries[0].mood) : "😊"}
                  </h3>
                </div>
                <Smile className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mood Tracking */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-secondary" />
                  <span>How are you feeling today?</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-3 mb-6">
                  {moodEmojis.map((mood) => (
                    <Button
                      key={mood.value}
                      variant={selectedMood === mood.value ? "default" : "outline"}
                      className={`p-4 h-auto flex-col space-y-2 ${
                        selectedMood === mood.value ? "bg-secondary text-white" : ""
                      }`}
                      onClick={() => setSelectedMood(mood.value)}
                    >
                      <div className="text-3xl">{mood.emoji}</div>
                      <div className="text-xs">{mood.label}</div>
                    </Button>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Notes (optional)
                  </label>
                  <Textarea
                    placeholder="How was your day? Any thoughts you'd like to record..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <Button
                  onClick={handleMoodSubmit}
                  disabled={!selectedMood || moodMutation.isPending}
                  className="w-full bg-secondary text-white hover:bg-secondary/90"
                >
                  {moodMutation.isPending ? "Recording..." : "Record Mood"}
                </Button>
              </CardContent>
            </Card>

            {/* Mood History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Mood Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-accent rounded"></div>
                    ))}
                  </div>
                ) : entries.length === 0 ? (
                  <div className="text-center py-8">
                    <Smile className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No mood entries yet. Start tracking your mood today!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {entries.slice(0, 5).map((entry: WellnessEntry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getMoodEmoji(entry.mood)}</div>
                          <div>
                            <p className="font-medium text-foreground">{getMoodLabel(entry.mood)}</p>
                            {entry.notes && (
                              <p className="text-sm text-muted-foreground">{entry.notes}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Daily Health Tip */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-foreground">Daily Health Tip</h4>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200" 
                  alt="Wellness and healthy lifestyle" 
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

            {/* Wellness Resources */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-secondary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Wellness Resources</h4>
                </div>
                
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200" 
                  alt="Healthcare wellness resources" 
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
      </div>
    </div>
  );
}