import React, { useState, useEffect } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Checkbox,
  Flex,
  Image,
  Text,
  Title,
  Tooltip,
  Textarea,
} from "@mantine/core";
import { IconArrowRight, IconDog, IconSmoking } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { WishlistButton } from "../../components/WishlistButton/WishlistButton";
import { useUpdatePropertyNote } from "./wishlist-queries";
import { showNotification } from "@mantine/notifications";

export function WishlistPropertyCard({
    property,
    isSelected,
    onToggleSelect,
  })  {
  const [isEditing, setIsEditing] = useState(false);
  const [originalNote, setOriginalNote] = useState(property.note || "");
  const [note, setNote] = useState(property.note || "");

  useEffect(() => {
    setOriginalNote(property.note || "");
    setNote(property.note || "");
  }, [property.note]);

  const updateNoteMutation = useUpdatePropertyNote();

  const hasChanged = note !== originalNote;

  const handleEnterEditMode = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setNote(originalNote);
    setIsEditing(false);
  };

  const handleSave = () => {
    updateNoteMutation.mutate(
      { propertyId: property.id, note },
      {
        onSuccess: () => {
          setOriginalNote(note);
          setIsEditing(false);

          showNotification({
            title: "Note saved",
            message: "Your note has been updated successfully!",
            color: "green",
          });
        },
      }
    );
  };

  function renderFormattedNote(text) {
    return (
      <Text c="blue" size="sm" fw={700} style={{ fontStyle: "italic" }}>
        {text}
      </Text>
    );
  }

  return (
    <Card withBorder p="md" shadow="sm">
      <Card.Section>
        <Image
          src={property.media}
          alt={property.title}
          style={{ width: "100%", height: "200px", objectFit: "cover" }}
        />
      </Card.Section>
      
      <Flex align="center" justify="space-between" mt="sm">
        <Title order={4}>{property.title}</Title>
        <Checkbox
          label="Compare"
          checked={isSelected}
          onChange={() => onToggleSelect(property.id)}
        />
      </Flex>

      <Flex gap={4} mt="xs">
        <Badge radius="xs" size="lg">
          € {property.totalRent}
        </Badge>
        {property.isSublet && (
          <Badge radius="xs" size="lg" color="blue">
            Sublet
          </Badge>
        )}

        <Flex gap={4} ml="auto">
          {property.pets && (
            <Tooltip label="Pets Allowed" position="bottom">
              <ActionIcon radius="xs" variant="light">
                <IconDog size={16} />
              </ActionIcon>
            </Tooltip>
          )}

          {property.smoking && (
            <Tooltip label="Smoking Allowed" position="bottom">
              <ActionIcon radius="xs" variant="light">
                <IconSmoking size={16} />
              </ActionIcon>
            </Tooltip>
          )}

          <WishlistButton propertyId={property.id} />
        </Flex>
      </Flex>

      <Text my="sm">{property.description.slice(0, 50)}...</Text>

      <div style={{ minHeight: "100px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        {!isEditing ? (
            <>
            {originalNote ? (
                <>
                {renderFormattedNote(originalNote)}

                <Button mt="md" variant="outline" onClick={handleEnterEditMode}>
                    Edit Note
                </Button>
                </>
            ) : (
                <Button mt="md" variant="outline" onClick={handleEnterEditMode}>
                Add Note
                </Button>
            )}
            </>
        ) : (
            <>
            <Textarea
                placeholder="Write your note here..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                mb="sm"
            />

            <Flex gap="sm">
                <Button
                variant="filled"
                disabled={!hasChanged || updateNoteMutation.isLoading}
                onClick={handleSave}
                >
                Save Note
                </Button>
                <Button variant="outline" color="gray" onClick={handleCancel}>
                Cancel
                </Button>
            </Flex>
            </>
        )}
      </div>

      <Button
        mt="md"
        variant="light"
        component={Link}
        to={`/property/${property.id}`}
        rightSection={<IconArrowRight size={16} />}
        fullWidth
      >
        View Details
      </Button>
    </Card>
  );
}