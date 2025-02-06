import { useAuth } from "../../lib/auth-context";
import { useWishlist } from "./wishlist-queries";
import GridView from "../home/grid-view";
import { Alert, Title } from "@mantine/core";

export const WishlistPage = () => {
  const { user, isLoading } = useAuth();
  const { data: wishlist, isLoading: wishlistLoading } = useWishlist();

  if (isLoading || wishlistLoading) return <p>Loading...</p>;

  if (!user || user.type !== "STUDENT") {
    return <p>Unauthorized: Only students can access the wishlist.</p>;
  }

  return (
    <>
      <Title order={2} mb="lg">
        Your Wishlist
      </Title>

      {wishlist.length === 0 ? (
        <Alert color="gray">No wishlisted properties</Alert>
      ) : (
        <GridView properties={wishlist} />
      )}
    </>
  );
};
