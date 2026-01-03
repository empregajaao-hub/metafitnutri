import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Mail, Clock, Shield, Send, HelpCircle, ChevronDown, ChevronUp, CheckCircle, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const SupportEN = () => {
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
      answer: "MetaFit Nutri is a free AI-powered nutrition tracking app. Simply take a photo of your meal and our artificial intelligence will automatically analyze the food, identifying ingredients and calculating nutritional values including calories, protein, carbohydrates, and fats."
    },
    {
      question: "Is MetaFit Nutri free to use?",
      answer: "Yes! MetaFit Nutri is completely free. You can perform unlimited meal analyses, generate personalized meal plans, and access all features at no cost."
    },
    {
      question: "How does the photo analysis work?",
      answer: "It's simple: take a photo of your meal using your phone's camera. Our AI analyzes the foods in your plate and automatically calculates nutritional values including calories, protein, carbohydrates, and fats."
    },
    {
      question: "Are the meal plans personalized?",
      answer: "Yes! Meal plans are tailored to your personal goals (lose weight, maintain, or build muscle) and can include local ingredients to make meal preparation easier."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely! Your privacy is our priority. All data is encrypted and stored securely. We never share your personal information with third parties. See our Privacy Policy for more details."
    },
    {
      question: "How do I delete my account?",
      answer: "To delete your account, go to Profile → Settings → Delete Account. All your data will be permanently removed and this action cannot be undone."
    }
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
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
              Your AI-powered nutrition tracking companion. Analyze meals with a photo, track your macros, and achieve your health goals.
            </p>
          </div>

          {/* App Description */}
          <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
            <h2 className="text-xl font-semibold text-foreground mb-3">About MetaFit Nutri</h2>
            <p className="text-muted-foreground leading-relaxed">
              MetaFit Nutri is a free mobile application that uses artificial intelligence to help you track your nutrition effortlessly. 
              Simply take a photo of your meal, and our AI instantly identifies the foods and calculates calories, protein, carbohydrates, and fats. 
              Whether you want to lose weight, maintain your current physique, or build muscle, MetaFit Nutri provides personalized meal plans and 
              nutritional insights to help you reach your goals.
            </p>
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
                  For detailed inquiries and support requests
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
                  <span className="text-muted-foreground">Email: within 24-48 hours</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-muted-foreground">Business hours: Mon-Fri</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-muted-foreground">Priority: Account & billing issues</span>
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
                Find answers to common questions
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
                Can't find what you're looking for? Send us a message.
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
                  placeholder="Describe your question or issue in detail..."
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
                <p className="text-muted-foreground text-sm leading-relaxed">
                  MetaFit Nutri is committed to protecting your privacy. Your personal data is encrypted and stored securely. 
                  We do not sell or share your information with third parties. Meal photos are processed securely and you have 
                  full control over your data. You can delete your account and all associated data at any time from the app settings.
                </p>
                <Link 
                  to="/privacy" 
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mt-3 text-sm"
                >
                  <span className="underline">Read our full Privacy Policy</span>
                </Link>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p className="font-medium">MetaFit Nutri</p>
            <p className="mt-1">Your AI-powered nutrition companion</p>
            <p className="mt-2 text-xs">© 2025 MetaFit Nutri. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportEN;
