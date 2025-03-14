
import { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  User, 
  HelpCircle, 
  Star,
  ChevronRight,
  Search,
  Mail,
  MessageCircle,
  Phone,
  ArrowLeft,
  Tag,
  Bookmark,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { helpArticles, helpCategories } from "./help/help-data";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export function ProfileHelp() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<typeof helpArticles[0] | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<typeof helpArticles>([]);

  // Filter FAQs based on search query
  const filteredCategories = helpCategories.filter(category => 
    activeCategory === "all" || category.id === activeCategory
  );
  
  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = 
      searchQuery === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      activeCategory === "all" || 
      article.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Count total matching articles
  const totalResults = filteredArticles.length;

  useEffect(() => {
    if (selectedArticle) {
      // Find related articles in the same category
      const related = helpArticles
        .filter(article => 
          article.category === selectedArticle.category && 
          article.id !== selectedArticle.id
        )
        .slice(0, 3);
      
      setRelatedArticles(related);
    }
  }, [selectedArticle]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatMarkdownContent = (content: string) => {
    // This is a simple markdown parser for demonstration
    // Replace headers
    let formatted = content
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold my-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold my-2">$1</h3>');
    
    // Replace bold and italic
    formatted = formatted
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Replace lists
    formatted = formatted
      .replace(/^\- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/<\/li>\n<li/g, '</li><li');
    
    // Add paragraphs
    formatted = formatted
      .replace(/^(?!<[hl]|<li)(.*$)/gm, '<p class="my-2">$1</p>');
    
    // Clean up empty paragraphs
    formatted = formatted.replace(/<p class="my-2"><\/p>/g, '');
    
    return formatted;
  };
  
  const getCategoryById = (id: string) => {
    return helpCategories.find(category => category.id === id) || helpCategories[0];
  };

  const getCategoryTitle = (categoryId: string) => {
    const category = getCategoryById(categoryId);
    return category ? category.title : '';
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6 text-left">
      {selectedArticle ? (
        // Article detail view
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedArticle(null)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Help Center
            </Button>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                  {getCategoryTitle(selectedArticle.category)}
                </Badge>
                <span className="text-muted-foreground text-sm">
                  Updated {formatDate(selectedArticle.updatedAt)}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold mb-6">{selectedArticle.title}</h1>
              
              <div 
                className="prose max-w-none" 
                dangerouslySetInnerHTML={{ __html: formatMarkdownContent(selectedArticle.content) }}
              />
              
              <Separator className="my-6" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-2" /> Helpful
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsDown className="h-4 w-4 mr-2" /> Not Helpful
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Still need help?</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => setContactFormOpen(true)}
                  className="flex-1"
                >
                  <MessageCircle className="h-4 w-4 mr-2" /> Contact Support
                </Button>
                <Button variant="outline" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" /> Email Us
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            {relatedArticles.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-bold text-lg mb-3">Related Articles</h3>
                <ul className="space-y-3">
                  {relatedArticles.map(article => (
                    <li key={article.id}>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start h-auto py-2 text-left"
                        onClick={() => setSelectedArticle(article)}
                      >
                        <div>
                          <span className="block font-medium">{article.title}</span>
                          <span className="text-sm text-muted-foreground flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" /> 
                            {formatDate(article.updatedAt)}
                          </span>
                        </div>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="bg-white rounded-lg shadow-sm border p-4 mt-4">
              <h3 className="font-bold text-lg mb-3">Popular Categories</h3>
              <div className="space-y-2">
                {helpCategories.map(category => {
                  const CategoryIcon = category.icon;
                  return (
                    <Button 
                      key={category.id}
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedArticle(null);
                        setActiveCategory(category.id);
                      }}
                    >
                      <CategoryIcon className="h-4 w-4 mr-2" />
                      <span>{category.title}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-lg border p-4 mt-4">
              <h3 className="font-medium mb-2">Support Hours</h3>
              <p className="text-sm text-muted-foreground">
                Monday-Friday: 9AM-6PM EST<br />
                Saturday: 10AM-4PM EST<br />
                Sunday: Closed
              </p>
              <p className="text-sm mt-2">
                Premium members get 24/7 priority support
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Help center main view
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Help Center</h1>
            <p className="text-muted-foreground">
              Find answers to common questions or contact our support team
            </p>
          </div>
          
          {/* Search and Contact */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <Input
                icon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help..."
                className="w-full"
              />
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-2">
                  Found {totalResults} results for "{searchQuery}"
                </p>
              )}
            </div>
            <Dialog open={contactFormOpen} onOpenChange={setContactFormOpen}>
              <DialogTrigger asChild>
                <Button className="whitespace-nowrap">
                  <MessageCircle className="h-4 w-4 mr-2" /> Contact Support
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Contact Support</DialogTitle>
                  <DialogDescription>
                    Our team is here to help. Please fill out the form below and we'll get back to you as soon as possible.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                    <Input id="subject" placeholder="What do you need help with?" />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <textarea 
                      id="message" 
                      className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Please describe your issue in detail..."
                    ></textarea>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Preferred Contact Method</label>
                    <div className="flex gap-4">
                      <Button variant="outline" className="flex-1">
                        <Mail className="h-4 w-4 mr-2" /> Email
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Phone className="h-4 w-4 mr-2" /> Phone
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setContactFormOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    setContactFormOpen(false);
                    // Here you would normally submit the form
                    // For now we'll just show a toast via alert
                    alert("Your message has been sent! Our team will contact you shortly.");
                  }}>
                    Submit Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Tab Navigation and Content */}
          <Tabs defaultValue="all" onValueChange={setActiveCategory} value={activeCategory}>
            <TabsList className="mb-6 w-full overflow-x-auto flex flex-nowrap justify-start">
              <TabsTrigger value="all">All Topics</TabsTrigger>
              {helpCategories.map(category => (
                <TabsTrigger key={category.id} value={category.id} className="whitespace-nowrap">
                  {category.title}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              {/* Category Cards for All Topics View */}
              {!searchQuery ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {helpCategories.map(category => {
                    const CategoryIcon = category.icon;
                    return (
                      <Card 
                        key={category.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow text-left"
                        onClick={() => setActiveCategory(category.id)}
                      >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <div className="flex items-center">
                            <div className="mr-2 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                              <CategoryIcon className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg">{category.title}</CardTitle>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-base">
                            {category.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                // Show filtered results when searching
                <div className="space-y-8">
                  {filteredArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredArticles.map(article => {
                        const category = getCategoryById(article.category);
                        const CategoryIcon = category.icon;
                        return (
                          <Card 
                            key={article.id} 
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedArticle(article)}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-center gap-2 mb-1">
                                <CategoryIcon className="h-4 w-4 text-primary" />
                                <span className="text-sm text-muted-foreground">{category.title}</span>
                              </div>
                              <CardTitle className="text-lg">{article.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <CardDescription className="line-clamp-2">
                                {article.content.substring(0, 120).replace(/[#*]/g, '')}...
                              </CardDescription>
                              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Updated {formatDate(article.updatedAt)}
                                </span>
                                <span className="flex items-center">
                                  <Eye className="h-3 w-3 mr-1" />
                                  {article.viewCount} views
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No results found</h3>
                      <p className="text-muted-foreground mb-6">
                        We couldn't find any answers matching your search.
                      </p>
                      <Button
                        onClick={() => setContactFormOpen(true)}
                        variant="outline"
                      >
                        Contact Support
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            {/* Individual Category Views */}
            {helpCategories.map(category => {
              const categoryArticles = helpArticles.filter(article => 
                article.category === category.id &&
                (!searchQuery || 
                  article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  article.content.toLowerCase().includes(searchQuery.toLowerCase()))
              );
              
              const CategoryIcon = category.icon;
              
              return (
                <TabsContent key={category.id} value={category.id} className="space-y-6">
                  <div className="flex items-center mb-4">
                    <CategoryIcon className="h-6 w-6 mr-2 text-primary" />
                    <h2 className="text-2xl font-bold">{category.title}</h2>
                  </div>
                  <p className="text-muted-foreground mb-6">{category.description}</p>
                  
                  {categoryArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryArticles.map(article => (
                        <Card 
                          key={article.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedArticle(article)}
                        >
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{article.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <CardDescription className="line-clamp-2">
                              {article.content.substring(0, 120).replace(/[#*]/g, '')}...
                            </CardDescription>
                            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Updated {formatDate(article.updatedAt)}
                              </span>
                              <span className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                {article.viewCount} views
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No results found</h3>
                      <p className="text-muted-foreground mb-6">
                        We couldn't find any answers matching your search.
                      </p>
                      <Button
                        onClick={() => setContactFormOpen(true)}
                        variant="outline"
                      >
                        Contact Support
                      </Button>
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
          
          {/* Contact Options */}
          <div className="mt-12 p-6 border rounded-lg bg-muted/30">
            <h2 className="text-xl font-semibold mb-4 text-left">Still need help?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" onClick={() => setContactFormOpen(true)}>
                <Mail className="h-8 w-8 mb-2" />
                <span className="font-medium">Email Support</span>
                <span className="text-xs text-muted-foreground mt-1">Response within 24 hours</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                <MessageCircle className="h-8 w-8 mb-2" />
                <span className="font-medium">Live Chat</span>
                <span className="text-xs text-muted-foreground mt-1">Available 9AM-6PM</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                <Phone className="h-8 w-8 mb-2" />
                <span className="font-medium">Phone Support</span>
                <span className="text-xs text-muted-foreground mt-1">Premium members only</span>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
