import { useState } from "react";
import { useAuth } from "../../lib/auth-context";
import { useWishlist } from "./wishlist-queries";
import { Alert, Title, Button, Modal } from "@mantine/core";
import { WishlistCompareView } from "./wishlist-compare-view";
import { CompareTable } from "./compare-table";
import { WishlistMapView } from "./wishlist-map-view";

export const WishlistPage = () => {
  const { user, isLoading } = useAuth();
  const { data: wishlist, isLoading: wishlistLoading } = useWishlist();

  const [selectedIds, setSelectedIds] = useState([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  if (isLoading || wishlistLoading) return <p>Loading...</p>;

  if (!user || user.type !== "STUDENT") {
    return <p>Unauthorized: Only students can access the wishlist.</p>;
  }

  const toggleSelect = (propertyId) => {
    setSelectedIds((prev) => {
      if (prev.includes(propertyId)) {
        return prev.filter((id) => id !== propertyId);
      } else {
        return [...prev, propertyId];
      }
    });
  };

  const selectedProperties = wishlist.filter((p) => selectedIds.includes(p.id));

  return (
    <>
      <Title order={2} mb="lg">
        Your Wishlist
      </Title>

      {wishlist.length === 0 ? (
        <Alert color="gray" fw={700}>
          No wishlisted properties
        </Alert>
      ) : (
        <>
          <Button mb="md" onClick={() => setCompareModalOpen(true)} disabled={selectedIds.length < 2}>
            Compare Selected ({selectedIds.length})
          </Button>

          <WishlistCompareView properties={wishlist} selectedIds={selectedIds} onToggleSelect={toggleSelect} />

          <Modal
            opened={compareModalOpen}
            onClose={() => setCompareModalOpen(false)}
            title={<span style={{ fontWeight: "bold", fontSize: "20px" }}>Compare Properties</span>}
            size="xl"
          >
            <CompareTable properties={selectedProperties} />
            <WishlistMapView properties={selectedProperties} />
          </Modal>
        </>
      )}
    </>
  );
};
