import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Mail, Clock, Shield, Send, HelpCircle, ChevronDown, ChevronUp, CheckCircle, Smartphone, Camera, Apple, Globe, Lock, Trash2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SupportEN = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    
    const subject = encodeURIComponent(`MetaFit Nutri Support - ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    window.location.href = `mailto:repairlubatec@gmail.com?subject=${subject}&body=${body}`;
    
    toast.success("Opening email client...");
    setName("");
    setEmail("");
    setMessage("");
    setIsSubmitting(false);
  };

  const faqs = [
    {
      question: "What is MetaFit Nutri?",
      answer: "MetaFit Nutri is a completely free AI-powered nutrition tracking app. Simply take a photo of your meal and our artificial intelligence will automatically analyze the food, identifying ingredients and calculating nutritional values including calories, protein, carbohydrates, and fats. The app helps you achieve your health goals whether you want to lose weight, maintain your current physique, or build muscle."
    },
    {
      question: "Is MetaFit Nutri really free?",
      answer: "Yes! MetaFit Nutri is 100% free with no hidden costs, subscriptions, or in-app purchases. All features including unlimited meal analyses, personalized meal plans, workout guides, and nutritional tracking are available at no cost to all users."
    },
    {
      question: "How does the AI photo analysis work?",
      answer: "Our advanced AI technology analyzes photos of your meals in seconds. Simply open the app, take a photo of your food, and the AI will identify the dishes and ingredients, then calculate the nutritional breakdown including calories, protein, carbohydrates, and fats. The analysis is performed securely and your photos are processed with strict privacy protection."
    },
    {
      question: "Why does the app need camera access?",
      answer: "MetaFit Nutri uses the camera to allow you to take and upload progress photos for nutritional monitoring, such as tracking body changes over time or analyzing your meals for nutritional content. You can also attach photos to your personal profile for health tracking purposes. Camera access is only used when you explicitly choose to take a photo."
    },
    {
      question: "Why does the app need photo library access?",
      answer: "Photo library access allows you to select existing meal photos from your gallery for nutritional analysis, and to save your progress photos and meal analysis results. This is optional and you can choose to only use the camera for taking new photos instead."
    },
    {
      question: "Are the meal plans personalized?",
      answer: "Yes! Meal plans are tailored to your personal goals (lose weight, maintain, or build muscle), your dietary preferences, and can include local ingredients to make meal preparation easier and more accessible."
    },
    {
      question: "Is my personal data secure?",
      answer: "Absolutely! Your privacy is our top priority. All data is encrypted using industry-standard protocols and stored securely. We never sell, share, or disclose your personal information to third parties for marketing or advertising purposes. Meal photos are processed securely and deleted after analysis unless you choose to save them."
    },
    {
      question: "Can I use the app without creating an account?",
      answer: "Yes! You can use MetaFit Nutri's meal analysis feature without creating an account. However, to save your analysis history, create personalized meal plans, and track your progress over time, we recommend creating a free account."
    },
    {
      question: "How do I delete my account and data?",
      answer: "You have full control over your data. To delete your account, go to Profile → Settings → Delete Account. This will permanently remove your account and all associated data including meal analyses, progress photos, and personal information. This action cannot be undone."
    },
    {
      question: "What devices is MetaFit Nutri available on?",
      answer: "MetaFit Nutri is available on iOS (iPhone and iPad) and can also be accessed via web browser on any device. The app is optimized for mobile use to make meal tracking convenient wherever you are."
    },
    {
      question: "How can I contact support?",
      answer: "You can reach our support team by email at repairlubatec@gmail.com. We typically respond within 24-48 business hours. You can also use the contact form on this page to send us a message directly."
    }
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Smartphone className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">
                MetaFit Nutri
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-2">
              Support Center
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your free AI-powered nutrition tracking companion. Analyze meals with a photo, track your macros, and achieve your health goals.
            </p>
          </div>

          {/* App Description */}
          <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
            <h2 className="text-xl font-semibold text-foreground mb-3">About MetaFit Nutri</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              MetaFit Nutri is a completely free mobile application that uses advanced artificial intelligence to help you track your nutrition effortlessly. 
              Simply take a photo of your meal, and our AI instantly identifies the foods and calculates calories, protein, carbohydrates, and fats.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="flex items-start gap-3">
                <Camera className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">AI Meal Analysis</p>
                  <p className="text-xs text-muted-foreground">Instant nutritional breakdown from photos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Apple className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">Personalized Plans</p>
                  <p className="text-xs text-muted-foreground">Meal plans tailored to your goals</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">100% Free</p>
                  <p className="text-xs text-muted-foreground">No subscriptions or hidden costs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">Privacy First</p>
                  <p className="text-xs text-muted-foreground">Your data is encrypted and secure</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Email */}
            <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-primary/30">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Email Support
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  For detailed inquiries, feedback, and support requests
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = "mailto:repairlubatec@gmail.com"}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  repairlubatec@gmail.com
                </Button>
              </div>
            </Card>

            {/* Response Time */}
            <Card className="p-6 border-2">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Response Time
                </h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-muted-foreground">Email responses: 24-48 business hours</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-muted-foreground">Business hours: Monday to Friday</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-muted-foreground">Priority: Technical issues & account problems</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                <HelpCircle className="inline h-6 w-6 mr-2" />
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Find answers to common questions about MetaFit Nutri
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:border-primary/30 transition-colors overflow-hidden"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground pr-4">
                        {faq.question}
                      </h4>
                      {expandedFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    {expandedFaq === index && (
                      <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <Card className="p-8 mb-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                <Send className="inline h-5 w-5 mr-2" />
                Contact Us
              </h3>
              <p className="text-muted-foreground">
                Have a question or feedback? We would love to hear from you.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Name *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Message *
                </label>
                <Textarea
                  id="message"
                  placeholder="Describe your question, feedback, or issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Data Safety Section */}
          <Card className="p-6 mb-8 border-2 border-green-500/20 bg-green-500/5">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Your Privacy & Data Safety</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  MetaFit Nutri is committed to protecting your privacy and personal data. Here is what you should know:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>All personal data is encrypted using industry-standard protocols</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>We never sell or share your information with third parties for advertising</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Meal photos are processed securely and you control whether to save them</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>You can delete your account and all data at any time from app settings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Camera and photo access are only used when you explicitly choose to take or select photos</span>
                  </li>
                </ul>
                <Link 
                  to="/privacy" 
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mt-4 text-sm"
                >
                  <span className="underline">Read our full Privacy Policy</span>
                </Link>
              </div>
            </div>
          </Card>

          {/* Account Deletion Info */}
          <Card className="p-6 mb-8 border-2 border-orange-500/20 bg-orange-500/5">
            <div className="flex items-start gap-4">
              <Trash2 className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Account Deletion</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  You have full control over your data. To delete your MetaFit Nutri account and all associated data:
                </p>
                <ol className="list-decimal list-inside mt-3 space-y-1 text-sm text-muted-foreground">
                  <li>Open the MetaFit Nutri app</li>
                  <li>Go to your Profile page</li>
                  <li>Tap on Settings or the gear icon</li>
                  <li>Scroll down and select "Delete Account"</li>
                  <li>Confirm deletion when prompted</li>
                </ol>
                <p className="text-xs text-muted-foreground mt-3">
                  Note: Account deletion is permanent and cannot be undone. All your data including meal analyses, progress photos, and personal information will be permanently removed.
                </p>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground border-t border-border pt-8">
            <p className="font-medium text-lg text-foreground">MetaFit Nutri</p>
            <p className="mt-1">Your free AI-powered nutrition companion</p>
            <p className="mt-4 text-xs">
              © 2025 METAFIT NUTRI. Developed by Lubatec.
            </p>
            <p className="mt-2 text-xs">
              For support inquiries: <a href="mailto:repairlubatec@gmail.com" className="text-primary hover:underline">repairlubatec@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportEN;
