import { WishlistPropertyCard } from "./wishlist-property-card";
import "../home/grid-view.css";

export function WishlistCompareView({ properties, selectedIds, onToggleSelect }) {
  return (
    <div className="property-grid">
      {properties.map((property) => (
        <WishlistPropertyCard
          key={property.id}
          property={property}
          isSelected={selectedIds.includes(property.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}
