import { useAuth } from "../../lib/auth-context";
import { useWishlist } from "./wishlist-queries";
import ListView from "../home/list-view";

export const WishlistPage = () => {
  const { user, isLoading } = useAuth();
  const { data: wishlist, isLoading: wishlistLoading } = useWishlist(); // Use React Query

  if (isLoading || wishlistLoading) return <p>Loading...</p>;

  if (!user || user.type !== "STUDENT") {
    return <p>Unauthorized: Only students can access the wishlist.</p>;
  }

  return (
    <div>
      <h2>Your Wishlist</h2>
      {wishlist.length === 0 ? (
        <p>No wishlisted properties</p>
      ) : (
        <ListView properties={wishlist} />
      )}
    </div>
  );
};