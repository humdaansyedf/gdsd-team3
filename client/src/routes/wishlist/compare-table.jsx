import { Table, Text } from "@mantine/core";

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
    return (
      <Text fw={700} ta="center">
        Not enough properties selected to compare.
      </Text>
    );
  }

  return (
    <Table.ScrollContainer>
      <Table withColumnBorders withRowBorders withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th miw={140}>Attribute</Table.Th>
            {properties.map((prop) => (
              <Table.Th key={prop.id} miw={200}>
                {prop.title}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>Total Rent (€)</Table.Td>
            {properties.map((prop) => (
              <Table.Td key={prop.id}>€{prop.totalRent}</Table.Td>
            ))}
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Sublet?</Table.Td>
            {properties.map((prop) => (
              <Table.Td key={prop.id}>{prop.isSublet ? "Yes" : "No"}</Table.Td>
            ))}
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Pets Allowed?</Table.Td>
            {properties.map((prop) => (
              <Table.Td key={prop.id}>{prop.pets ? "Yes" : "No"}</Table.Td>
            ))}
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Smoking Allowed?</Table.Td>
            {properties.map((prop) => (
              <Table.Td key={prop.id}>{prop.smoking ? "Yes" : "No"}</Table.Td>
            ))}
          </Table.Tr>

          <Table.Tr>
            <Table.Td>Amenities</Table.Td>
            {properties.map((prop) => {
              const availableAmenities = Object.entries(AMENITIES_MAP)
                .filter(([key]) => prop[key])
                .map(([_, label]) => label);

              return (
                <Table.Td key={prop.id}>
                  {availableAmenities.length > 0 ? (
                    <Text size="sm">{availableAmenities.join(", ")}</Text>
                  ) : (
                    <Text size="sm" c="dimmed">
                      No amenities listed
                    </Text>
                  )}
                </Table.Td>
              );
            })}
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
