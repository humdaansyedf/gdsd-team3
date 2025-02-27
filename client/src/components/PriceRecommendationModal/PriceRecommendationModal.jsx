import React from "react";
import { Modal, Text, Group, NumberInput, Button } from "@mantine/core";

export const PriceRecommendationModal = ({
                                      isOpen,
                                      onClose,
                                      recommendedPrice,
                                      form,
                                      setFinalPayload,
                                      submitAfterConfirmation,
                                  }) => {
    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            title="We have calculated a recommended price for you:"
            size="lg"
        >
            <Text size="md" weight={500}>
                You can edit your price here or leave it as is.
            </Text>

            <Group mt="md" grow>
                <Text size="md">
                    Recommended Total Price Range:
                    <Text span c="green">
                        {" "}
                        €{parseInt(recommendedPrice * 0.8)} - €
                        {parseInt(recommendedPrice * 1.2)}
                    </Text>
                </Text>
            </Group>

            <Group mt="md" grow>
                <NumberInput
                    label="Cold Rent (€)"
                    min={0}
                    description="Base rent"
                    value={form.values.coldRent}
                    withAsterisk
                    onChange={(value) =>
                        form.setFieldValue("coldRent", value || form.values.coldRent)
                    }
                    {...form.getInputProps("coldRent")}
                />

                <NumberInput
                    label="Additional Costs (€)"
                    description="e.g. Heating, Water, etc."
                    min={0}
                    value={form.values.additionalCosts}
                    onChange={(value) =>
                        form.setFieldValue(
                            "additionalCosts",
                            value || form.values.additionalCosts
                        )
                    }
                    {...form.getInputProps("additionalCosts")}
                />
                <NumberInput
                    label="Total Rent (€)"
                    withAsterisk
                    readOnly
                    description="Cold Rent + Additional Costs."
                    value={form.values.coldRent + (form.values.additionalCosts || 0)}
                />
            </Group>

            <Button
                fullWidth
                color="green"
                type="submit"
                radius="md"
                size="md"
                my="md"
                onClick={() => {
                    // Update finalPayload and then submit
                    setFinalPayload((prev) => {
                        const updatedPayload = {
                            ...prev,
                            coldRent: form.values.coldRent,
                            additionalCosts: form.values.additionalCosts,
                            totalRent: form.values.coldRent + form.values.additionalCosts,
                            recommendedPrice: form.values.recommendedPrice,
                        };
                        submitAfterConfirmation(updatedPayload);
                        return updatedPayload;
                    });
                    onClose();
                }}
            >
                Confirm
            </Button>
        </Modal>
    );
};