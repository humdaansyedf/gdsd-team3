import { useLocation, Link } from "react-router-dom";
import { Button, Container, Group, Paper, Text, Title } from "@mantine/core";

export const AdConfirmation = () => {
  const location = useLocation();
  const propertyId = location.state?.propertyId || null;

  return (
    <Container>
      <Paper withBorder shadow="sm" p="xl" mt="xl">
        <Title order={2} mb="lg">
          Your ad request has been sent!
        </Title>
        <Text>
          We&apos;ll verify the documents and let you know shortly. The admin will review your files and documents and
          verify them accordingly. If everything turns out great, your ad will be published shortly. You will receive a
          notification within 1-2 business days.
        </Text>
        <Group mt="xl" gap="xs">
          <Button component={Link} to={`/messages`} size="lg" color="green">
            Messages
          </Button>
          <Button component={Link} to={`/dashboard`} size="lg" color="blue">
            Dashboard
          </Button>
          {propertyId && (
            <Button component={Link} to={`/property/${propertyId}/edit`} size="lg" color="yellow">
              Edit Ad
            </Button>
          )}
        </Group>
      </Paper>
    </Container>
  );
};
