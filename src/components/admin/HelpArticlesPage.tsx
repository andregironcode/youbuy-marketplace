
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, FileEdit, Trash, Eye } from "lucide-react";

export const HelpArticlesPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help Articles</h1>
          <p className="text-muted-foreground mt-1">
            Manage help articles for your users
          </p>
        </div>
        <Button className="bg-youbuy hover:bg-youbuy-dark">
          <Plus className="h-4 w-4 mr-2" />
          New Article
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { title: "How to sell your first item", category: "Selling", updated: "Yesterday", published: true },
              { title: "Payment methods explained", category: "Payments", updated: "3 days ago", published: true },
              { title: "Setting up your profile", category: "Getting Started", updated: "1 week ago", published: true },
              { title: "Shipping guidelines", category: "Selling", updated: "2 weeks ago", published: false },
              { title: "How to contact support", category: "Support", updated: "1 month ago", published: true },
            ].map((article, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{article.title}</TableCell>
                <TableCell>{article.category}</TableCell>
                <TableCell>{article.updated}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    article.published ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {article.published ? "Published" : "Draft"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <FileEdit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
