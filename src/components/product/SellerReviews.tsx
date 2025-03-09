import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Star, StarHalf, MessageCircle, Edit, Check, X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface Review {
  id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: {
    avatar_url: string | null;
    full_name: string | null;
    username: string | null;
  };
}

interface SellerReviewsProps {
  sellerId: string;
  sellerName: string;
}

export const SellerReviews = ({ sellerId, sellerName }: SellerReviewsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("seller_reviews")
        .select("id, reviewer_id, rating, comment, created_at")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      const reviewerIds = reviewsData.map((review) => review.reviewer_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, avatar_url, full_name, username")
        .in("id", reviewerIds);

      if (profilesError) throw profilesError;

      const reviewsWithProfiles = reviewsData.map((review) => {
        const reviewer = profilesData.find((profile) => profile.id === review.reviewer_id);
        return { ...review, reviewer };
      });

      setReviews(reviewsWithProfiles);

      if (reviewsWithProfiles.length > 0) {
        const total = reviewsWithProfiles.reduce((sum, review) => sum + review.rating, 0);
        setAverageRating(total / reviewsWithProfiles.length);
      } else {
        setAverageRating(null);
      }

      if (user) {
        const userReview = reviewsWithProfiles.find(
          (review) => review.reviewer_id === user.id
        );
        if (userReview) {
          setUserReview(userReview);
          setNewRating(userReview.rating);
          setNewComment(userReview.comment || "");
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load seller reviews",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [sellerId, user]);

  const handleReviewSubmit = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to review this seller",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (userReview) {
        const { error } = await supabase
          .from("seller_reviews")
          .update({
            rating: newRating,
            comment: newComment.trim() || null,
          })
          .eq("id", userReview.id);

        if (error) throw error;

        toast({
          title: "Review updated",
          description: "Your review has been updated successfully.",
        });
      } else {
        const { error } = await supabase.from("seller_reviews").insert({
          reviewer_id: user.id,
          seller_id: sellerId,
          rating: newRating,
          comment: newComment.trim() || null,
        });

        if (error) throw error;

        toast({
          title: "Review submitted",
          description: "Thank you for your feedback!",
        });
      }

      await fetchReviews();
      setIsReviewDialogOpen(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!user || !userReview) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("seller_reviews")
        .delete()
        .eq("id", userReview.id);

      if (error) throw error;

      toast({
        title: "Review deleted",
        description: "Your review has been deleted.",
      });

      setUserReview(null);
      setNewRating(5);
      setNewComment("");
      await fetchReviews();
      setIsReviewDialogOpen(false);
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Error",
        description: "Failed to delete your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="fill-yellow-400 text-yellow-400 h-4 w-4" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalf key={i} className="fill-yellow-400 text-yellow-400 h-4 w-4" />);
      } else {
        stars.push(<Star key={i} className="text-gray-300 h-4 w-4" />);
      }
    }

    return stars;
  };

  const renderRatingSelector = () => {
    return (
      <div className="flex items-center space-x-1 mb-4">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => setNewRating(rating)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                rating <= newRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const visibleReviews = expanded ? reviews : reviews.slice(0, 3);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Customer Reviews</h2>
        <Button
          onClick={() => setIsReviewDialogOpen(true)}
          variant="outline"
          className="text-sm"
        >
          {userReview ? "Edit your review" : "Write a review"}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          {[1, 2, 3].map((i) => (
            <Card key={i} className="mb-4">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center mb-4">
            {averageRating !== null ? (
              <>
                <div className="flex mr-2">
                  {renderStars(averageRating)}
                </div>
                <span className="font-semibold mr-2">{averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
              </>
            ) : (
              <span className="text-muted-foreground">No reviews yet</span>
            )}
          </div>

          {reviews.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                <p className="text-muted-foreground">This seller doesn't have any reviews yet.</p>
                <p className="text-muted-foreground text-sm mt-1">Be the first to leave feedback!</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {visibleReviews.map((review) => (
                  <Card key={review.id} className="mb-4">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.reviewer?.avatar_url || ''} />
                          <AvatarFallback>
                            {review.reviewer?.full_name?.substring(0, 2) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {review.reviewer?.full_name || "Anonymous"}
                              </p>
                              <div className="flex items-center">
                                <div className="flex mr-2">
                                  {renderStars(review.rating)}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {user?.id === review.reviewer_id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsReviewDialogOpen(true)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {review.comment && <p className="text-sm">{review.comment}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {reviews.length > 3 && (
                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setExpanded(!expanded)}
                    className="text-youbuy hover:text-youbuy-dark"
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="mr-1 h-4 w-4" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-1 h-4 w-4" />
                        Show all reviews ({reviews.length})
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {userReview ? "Edit your review" : `Review ${sellerName}`}
            </DialogTitle>
            <DialogDescription>
              Share your experience with this seller to help other buyers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Your rating</p>
              {renderRatingSelector()}
            </div>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your review here (optional)"
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            {userReview && (
              <Button
                variant="outline"
                onClick={handleDeleteReview}
                disabled={isSubmitting}
                className="text-destructive border-destructive hover:bg-destructive/10"
              >
                <X className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                onClick={() => setIsReviewDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReviewSubmit}
                disabled={isSubmitting}
                className="bg-youbuy hover:bg-youbuy-dark"
              >
                <Check className="mr-2 h-4 w-4" />
                {isSubmitting ? "Submitting..." : userReview ? "Update" : "Submit"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
