import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Phone, User, Heart, Stethoscope, Baby, Shield } from "lucide-react";
import Header from "@/components/Header";

const appointmentSchema = z.object({
  doctorType: z.string().min(1, "Please select a doctor type"),
  preferredDate: z.string().min(1, "Please select a preferred date"),
  preferredTime: z.string().min(1, "Please select a preferred time"),
  symptoms: z.string().min(10, "Please describe your symptoms (at least 10 characters)"),
  urgency: z.string().min(1, "Please select urgency level"),
  contactPhone: z.string().min(10, "Please enter a valid phone number"),
  notes: z.string().optional(),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

const doctorTypes = [
  { value: "gynecologist", label: "Gynecologist", icon: "👩‍⚕️", description: "Women's reproductive health" },
  { value: "obstetrician", label: "Obstetrician", icon: "🤱", description: "Pregnancy and childbirth" },
  { value: "endocrinologist", label: "Endocrinologist", icon: "🔬", description: "Hormonal health" },
  { value: "cardiologist", label: "Cardiologist", icon: "❤️", description: "Heart and cardiovascular health" },
  { value: "dermatologist", label: "Dermatologist", icon: "🌟", description: "Skin and hair health" },
  { value: "psychiatrist", label: "Psychiatrist", icon: "🧠", description: "Mental health and wellness" },
  { value: "general", label: "General Practitioner", icon: "👨‍⚕️", description: "General health concerns" },
];

const urgencyLevels = [
  { value: "routine", label: "Routine Check-up", color: "text-green-600" },
  { value: "concern", label: "Health Concern", color: "text-yellow-600" },
  { value: "urgent", label: "Urgent Issue", color: "text-orange-600" },
  { value: "emergency", label: "Emergency", color: "text-red-600" },
];

export default function AppointmentsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctorType: "",
      preferredDate: "",
      preferredTime: "",
      symptoms: "",
      urgency: "",
      contactPhone: "",
      notes: "",
    },
  });

  const onSubmit = async (data: AppointmentForm) => {
    setIsSubmitting(true);
    
    // Simulate appointment booking
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Appointment Request Submitted!",
      description: "We'll contact you within 24 hours to confirm your appointment. You'll receive a confirmation message shortly.",
    });
    
    form.reset();
    setIsSubmitting(false);
  };

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Tomorrow
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60); // 2 months from now
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Book Doctor Appointment</h1>
          <p className="text-muted-foreground">Connect with specialized women's health professionals for personalized care</p>
        </div>

        {/* Service Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Secure & Private</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4 text-center">
              <Stethoscope className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Expert Doctors</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Quick Booking</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4 text-center">
              <Heart className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Women-Focused</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Appointment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-secondary" />
                  <span>Schedule Your Appointment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Doctor Type Selection */}
                    <FormField
                      control={form.control}
                      name="doctorType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type of Doctor</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select specialist" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {doctorTypes.map((doctor) => (
                                <SelectItem key={doctor.value} value={doctor.value}>
                                  <div className="flex items-center space-x-2">
                                    <span>{doctor.icon}</span>
                                    <div>
                                      <div className="font-medium">{doctor.label}</div>
                                      <div className="text-xs text-muted-foreground">{doctor.description}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date and Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="preferredDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                min={getMinDate()}
                                max={getMaxDate()}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="preferredTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Time</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="09:00">9:00 AM</SelectItem>
                                <SelectItem value="10:00">10:00 AM</SelectItem>
                                <SelectItem value="11:00">11:00 AM</SelectItem>
                                <SelectItem value="14:00">2:00 PM</SelectItem>
                                <SelectItem value="15:00">3:00 PM</SelectItem>
                                <SelectItem value="16:00">4:00 PM</SelectItem>
                                <SelectItem value="17:00">5:00 PM</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Urgency Level */}
                    <FormField
                      control={form.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Urgency Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="How urgent is this?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {urgencyLevels.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  <span className={level.color}>{level.label}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Contact Phone */}
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Enter your phone number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Symptoms Description */}
                    <FormField
                      control={form.control}
                      name="symptoms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Symptoms & Health Concerns</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please describe your symptoms, concerns, or reason for the appointment..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Additional Notes */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any additional information you'd like the doctor to know..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-secondary text-white hover:bg-secondary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting Request..." : "Book Appointment"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* How it Works */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-secondary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium text-foreground">Submit Request</p>
                    <p className="text-sm text-muted-foreground">Fill out the appointment form with your details</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-secondary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium text-foreground">Review & Confirm</p>
                    <p className="text-sm text-muted-foreground">Our team reviews and contacts you within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-secondary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium text-foreground">Meet Your Doctor</p>
                    <p className="text-sm text-muted-foreground">Attend your appointment and get expert care</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-foreground">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-foreground">Available nationwide</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-foreground">Mon-Fri: 8AM-8PM</span>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Notice */}
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-xl">⚠️</span>
                  </div>
                  <div>
                    <p className="font-medium text-red-800 mb-1">Medical Emergency?</p>
                    <p className="text-sm text-red-700 mb-2">If this is a medical emergency, please call 911 or visit your nearest emergency room immediately.</p>
                    <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">
                      Call 911
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}