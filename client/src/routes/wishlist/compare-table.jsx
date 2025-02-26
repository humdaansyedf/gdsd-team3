import React from "react";
import { Table, Text, Paper } from "@mantine/core";
import classes from "./compare-table.module.css";

const AMENITIES_MAP = {
    pets: "Pets Allowed",
    smoking: "Smoking Allowed",
    kitchen: "Kitchen",
    furnished: "Furnished",
    balcony: "Balcony",
    cellar: "Cellar",
    washingMachine: "Washing Machine",
    elevator: "Elevator",
    garden: "Garden",
    parking: "Parking",
    internet: "Internet",
    cableTv: "Cable TV",
  };

export function CompareTable({ properties }) {
  if (properties.length < 2) {
    return <Text fw={700} ta="center">Not enough properties selected to compare.</Text>;
  }

  return (
    <Paper shadow="sm" radius="md" p="lg" className={classes.tableContainer}>
        <Table striped highlightOnHover withBorder>
        <thead>
            <tr>
            <th style={{ borderRight: "2px solid #ddd" }}>Attribute</th>
            {properties.map((prop) => (
                <th key={prop.id} style={{ borderRight: "2px solid #ddd", textAlign: "center" }}>
                {prop.title}
                </th>
            ))}
            </tr>
        </thead>
        <tbody>
            <tr>
            <td style={{ borderRight: "2px solid #ddd" }}>Total Rent (€)</td>
            {properties.map((prop) => (
                <td key={prop.id} style={{ borderRight: "2px solid #ddd", textAlign: "center" }}>
                    €{prop.totalRent}
                </td>
            ))}
            </tr>
            <tr>
            <td style={{ borderRight: "2px solid #ddd" }}>Sublet?</td>
            {properties.map((prop) => (
                <td key={prop.id} style={{ borderRight: "2px solid #ddd", textAlign: "center" }}>
                {prop.isSublet ? "Yes" : "No"}
                </td>
            ))}
            </tr>
            <tr>
            <td style={{ borderRight: "2px solid #ddd" }}>Pets Allowed?</td>
            {properties.map((prop) => (
                <td key={prop.id} style={{ borderRight: "2px solid #ddd", textAlign: "center" }}>
                {prop.pets ? "Yes" : "No"}
                </td>
            ))}
            </tr>
            <tr>
            <td style={{ borderRight: "2px solid #ddd" }}>Smoking Allowed?</td>
            {properties.map((prop) => (
                <td key={prop.id} style={{ borderRight: "2px solid #ddd", textAlign: "center" }}>
                {prop.smoking ? "Yes" : "No"}
                </td>
            ))}
            </tr>

            <tr>
                <td style={{ borderRight: "2px solid #ddd" }}>Amenities</td>
                {properties.map((prop) => {
                    // Get the list of available amenities (where boolean is true)
                    const availableAmenities = Object.entries(AMENITIES_MAP)
                    .filter(([key]) => prop[key]) // Check if the property has this amenity
                    .map(([_, label]) => label); // Extract the readable name

                    return (
                    <td key={prop.id} style={{ borderRight: "2px solid #ddd" }}>
                        {availableAmenities.length > 0 ? (
                        <Text size="sm">{availableAmenities.join(", ")}</Text> // Comma-separated amenities
                        ) : (
                        <Text size="sm" c="dimmed">No amenities listed</Text>
                        )}
                    </td>
                    );
                })}
            </tr>


        </tbody>
        </Table>
    </Paper>
  );
}
