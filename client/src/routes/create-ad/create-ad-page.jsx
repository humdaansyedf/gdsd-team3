import React from "react";
import { Modal, Button } from "@mantine/core"; // Modal library for popup functionality
import { TextInput, Textarea, FileInput, NumberInput, Select } from "@mantine/core"; // Form components
import classes from "./create-ad-style.module.css";
import { DragDropImageUploader } from "../../components/ImageUploader/imageUploader";;

export const CreateAdModal = ({ opened, onClose }) => {
    return (
        <Modal
            opened={opened} // Control the visibility of the modal
            onClose={onClose} // Close the modal when the user clicks outside or presses the close button
            title="Create Property Listing" // Title of the modal
            size="70%" // Large size for accommodating forms
            centered
        >
            {/* Modal Content */}
            <div className={classes.container}>
                {/* Section for Uploading Photos */}
                <div className={classes.section}>
                    <DragDropImageUploader/>
                </div>

                {/* Property Details */}
                <div className={classes.propertyDetails}>
                    <TextInput label="Ad Title" placeholder="Enter Ad Title" />
                    <NumberInput label="Rent (€)" placeholder="Enter Rent" />
                    <Select
                        label="Location"
                        placeholder="Select Location"
                        data={[
                            { value: "downtown", label: "Downtown" },
                            { value: "suburb", label: "Suburb" },
                            { value: "city-center", label: "City Center" },
                        ]}
                    />
                </div>

                {/* Description */}
                <Textarea label="Description" placeholder="Enter Description" autosize minRows={3} mb='xl' />

                {/* Submit Button */}
                <Button fullWidth color="green" onClick={onClose}>
                    Submit
                </Button>
            </div>
        </Modal>
    );
};