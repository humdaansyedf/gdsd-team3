import { ActionIcon } from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import {
  useWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
} from "../../routes/wishlist/wishlist-queries";
import { notifications } from "@mantine/notifications";
import { useAuth } from "../../lib/auth-context";

export const WishlistButton = ({ propertyId }) => {
  const { user } = useAuth();
  const { data: wishlist } = useWishlist();
  const { mutate: addToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();

  const isWishlisted = wishlist?.some((item) => item.id === propertyId);

  const toggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(propertyId, {
        onSuccess: () =>
          notifications.show({
            title: "Removed",
            message: "Property removed from wishlist",
            color: "red",
          }),
      });
    } else {
      addToWishlist(propertyId, {
        onSuccess: () =>
          notifications.show({
            title: "Added",
            message: "Property added to wishlist",
            color: "green",
          }),
      });
    }
  };

  if (!user || user.type !== "STUDENT") return null; // Only show for students

  return (
    <ActionIcon onClick={toggleWishlist} variant="subtle">
      {isWishlisted ? (
        <IconHeartFilled color="red" size={16} />
      ) : (
        <IconHeart size={16} />
      )}
    </ActionIcon>
  );
};
