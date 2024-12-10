import {
    Anchor,
    Button,
    Container,
    Group,
    Paper,
    PasswordInput,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
  
  export function Register() {
    return (
      <Container size={600} my={40}>
        <Title ta="center">Create an Account</Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Already have an account?{" "}
          <Anchor size="sm" component="button">
            Login
          </Anchor>
        </Text>
  
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Title order={4} mb="md">
            Personal Details:
          </Title>
          <Group grow>
            <TextInput label="First Name" placeholder="Your first name" required />
            <TextInput label="Surname" placeholder="Your surname" required />
          </Group>
  
          <Group grow mt="md">
            <TextInput
              label="HS-Fulda Email"
              placeholder="yourname@hs-fulda.de"
              required
            />
            <TextInput label="Phone Number" placeholder="Your phone number" required />
          </Group>
  
          <Title order={4} mt="lg" mb="md">
            Address:
          </Title>
          <Group grow>
            <TextInput label="Apartment" placeholder="Apartment/Unit" />
            <TextInput label="Pin-Code" placeholder="Your pin-code" required />
          </Group>
  
          <Group grow mt="md">
            <TextInput label="Street" placeholder="Street Address" required />
            <TextInput label="Phone Number" placeholder="Additional contact number" />
          </Group>
  
          <Group grow mt="lg">
            <PasswordInput
              label="Password"
              placeholder="Create your password"
              required
            />
            <PasswordInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              required
            />
          </Group>
  
          <Button fullWidth mt="xl">
            Register
          </Button>
        </Paper>
      </Container>
    );
  }
  