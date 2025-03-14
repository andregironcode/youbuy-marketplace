
import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash, 
  AlignLeft,
  BookOpen,
  Tag,
  Eye,
  Clock,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { helpArticles } from "../../help/help-data";
import { helpCategories } from "../../help/help-data";
import { Textarea } from "@/components/ui/textarea";
import { AdminHelpArticleEditor } from "../../help/AdminHelpArticleEditor";

export const AdminHelpPage = () => {
  const [activeTab, setActiveTab] = useState("articles");
  const [searchQuery, setSearchQuery] = useState("");
  const [editorVisible, setEditorVisible] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<any>(null);
  const [sortOrder, setSortOrder] = useState<{column: string, direction: 'asc' | 'desc'}>({
    column: 'title',
    direction: 'asc'
  });

  const filteredArticles = helpArticles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSort = (column: string) => {
    setSortOrder({
      column,
      direction: sortOrder.column === column && sortOrder.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    // Handle different column types
    const val1 = a[sortOrder.column as keyof typeof a];
    const val2 = b[sortOrder.column as keyof typeof b];
    
    if (typeof val1 === 'string' && typeof val2 === 'string') {
      return sortOrder.direction === 'asc' 
        ? val1.localeCompare(val2) 
        : val2.localeCompare(val1);
    } else if (val1 instanceof Date && val2 instanceof Date) {
      return sortOrder.direction === 'asc' 
        ? val1.getTime() - val2.getTime() 
        : val2.getTime() - val1.getTime();
    } else if (typeof val1 === 'number' && typeof val2 === 'number') {
      return sortOrder.direction === 'asc' ? val1 - val2 : val2 - val1;
    }
    return 0;
  });

  const handleEditArticle = (article: any) => {
    setCurrentArticle(article);
    setEditorVisible(true);
  };

  const handleNewArticle = () => {
    setCurrentArticle({
      id: 'new',
      title: '',
      category: '',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
      published: false
    });
    setEditorVisible(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Help Center Administration</h1>
        <p className="text-muted-foreground">
          Manage help articles, categories, and customer support requests
        </p>
      </div>

      <Tabs defaultValue="articles" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="support">Support Requests</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Button onClick={handleNewArticle}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </div>
        </div>

        <TabsContent value="articles" className="space-y-4">
          <Card>
            <CardHeader className="px-6 py-4">
              <CardTitle>Help Articles</CardTitle>
              <CardDescription>
                Manage and update your knowledge base articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                      <div className="flex items-center">
                        Title
                        {sortOrder.column === 'title' && (
                          sortOrder.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('category')}>
                      <div className="flex items-center">
                        Category
                        {sortOrder.column === 'category' && (
                          sortOrder.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('updatedAt')}>
                      <div className="flex items-center">
                        Last Updated
                        {sortOrder.column === 'updatedAt' && (
                          sortOrder.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('viewCount')}>
                      <div className="flex items-center">
                        Views
                        {sortOrder.column === 'viewCount' && (
                          sortOrder.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('published')}>
                      <div className="flex items-center">
                        Status
                        {sortOrder.column === 'published' && (
                          sortOrder.direction === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">{article.title}</TableCell>
                      <TableCell>{article.category}</TableCell>
                      <TableCell>{formatDate(article.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1 text-muted-foreground" /> 
                          {article.viewCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          article.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {article.published ? 'Published' : 'Draft'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditArticle(article)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="px-6 py-4">
              <CardTitle>Help Categories</CardTitle>
              <CardDescription>
                Manage the categories for organizing help articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {helpCategories.map(category => (
                  <Card key={category.id} className="overflow-hidden">
                    <CardHeader className="px-4 py-3 bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-full bg-primary/10">
                            <category.icon className="h-4 w-4 text-primary" />
                          </div>
                          <CardTitle className="text-base">{category.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 py-3">
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {helpArticles.filter(article => article.category === category.id).length} articles
                        </span>
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {helpArticles.filter(article => article.category === category.id)
                            .reduce((sum, article) => sum + article.viewCount, 0)} views
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card className="overflow-hidden border-dashed border-2 flex flex-col items-center justify-center p-6">
                  <PlusCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-sm font-medium">Add New Category</p>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader className="px-6 py-4">
              <CardTitle>Support Requests</CardTitle>
              <CardDescription>
                View and respond to customer support tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">john.doe@example.com</TableCell>
                    <TableCell>Unable to complete checkout</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </TableCell>
                    <TableCell>Today, 10:30 AM</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">sarah.smith@example.com</TableCell>
                    <TableCell>Question about shipping options</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Resolved
                      </span>
                    </TableCell>
                    <TableCell>Yesterday, 3:45 PM</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">mike.johnson@example.com</TableCell>
                    <TableCell>Account verification issue</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        In Progress
                      </span>
                    </TableCell>
                    <TableCell>Jul 15, 2023</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editorVisible && (
        <AdminHelpArticleEditor 
          article={currentArticle}
          categories={helpCategories}
          onClose={() => setEditorVisible(false)}
          onSave={(article) => {
            console.log('Saving article:', article);
            setEditorVisible(false);
          }}
        />
      )}
    </div>
  );
};
