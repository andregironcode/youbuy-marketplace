
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Article = {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  published: boolean;
};

type Category = {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
};

interface AdminHelpArticleEditorProps {
  article: Article;
  categories: Category[];
  onClose: () => void;
  onSave: (article: Article) => void;
}

export const AdminHelpArticleEditor = ({
  article,
  categories,
  onClose,
  onSave
}: AdminHelpArticleEditorProps) => {
  const [editedArticle, setEditedArticle] = useState<Article>(article);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditedArticle(article);
  }, [article]);

  const handleChange = (field: keyof Article, value: any) => {
    setEditedArticle(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date()
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(editedArticle);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{article.id === 'new' ? 'Create New Article' : 'Edit Article'}</DialogTitle>
          <DialogDescription>
            {article.id === 'new' 
              ? 'Add a new help article to the knowledge base' 
              : 'Make changes to the existing help article'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={editedArticle.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter article title"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={editedArticle.category} 
              onValueChange={(value) => handleChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={editedArticle.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Write your article content here..."
              className="min-h-[300px]"
            />
            <p className="text-xs text-muted-foreground">
              Write your content in plain text. Use double asterisks for **bold** and single asterisks for *italic*.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={editedArticle.published}
              onCheckedChange={(checked) => handleChange('published', checked)}
            />
            <Label htmlFor="published">Published</Label>
          </div>

          {article.id !== 'new' && (
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <p><strong>Created:</strong> {editedArticle.createdAt.toLocaleString()}</p>
                <p><strong>Last Updated:</strong> {editedArticle.updatedAt.toLocaleString()}</p>
              </div>
              <div>
                <p><strong>Views:</strong> {editedArticle.viewCount}</p>
                <p><strong>ID:</strong> {editedArticle.id}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!hasChanges || !editedArticle.title}>
            {article.id === 'new' ? 'Create Article' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
