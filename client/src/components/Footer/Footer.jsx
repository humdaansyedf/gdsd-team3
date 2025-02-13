import { ActionIcon, Container, Group, Text } from "@mantine/core";
import {
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandYoutube,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import classes from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={classes.footer}>
      <Container fluid className={classes.inner}>
        <div className={classes.logo}>
          <Text component={Link} to="/" className={classes.logo}>
            NeuAnfang
          </Text>
          <Text size="xs" c="dimmed" className={classes.description}>
            A new beginning
          </Text>
        </div>

        <div className={classes.groups}>
          {/* About Section */}
          <div className={classes.wrapper}>
            <Text className={classes.title}>About</Text>
            <Text component={Link} to="/about" className={classes.link}>
              About Us
            </Text>
            <Text
              component="a"
              href="https://github.com/humdaansyedf/gdsd-team3"
              target="_blank"
              rel="noopener noreferrer"
              className={classes.link}
            >
              GitHub
            </Text>
          </div>

          {/* Contact Info Section */}
          <div className={classes.wrapper}>
            <Text className={classes.title}>Contact Info</Text>
            <Text className={classes.link}>support@neuanfang.com</Text>
            <Text className={classes.link}>Phone: +49 123 456 789</Text>
            <Text className={classes.link}>Address: Fulda, Germany</Text>
          </div>
        </div>
      </Container>

      <Container fluid className={classes.afterFooter}>
        <Text c="dimmed" size="sm">
          © 2024 NeuAnfang. All rights reserved.
        </Text>

        <Group gap={0} className={classes.social} justify="flex-end" wrap="nowrap">
          <ActionIcon size="lg" color="gray" variant="subtle">
            <IconBrandTwitter size={18} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size="lg" color="gray" variant="subtle">
            <IconBrandYoutube size={18} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size="lg" color="gray" variant="subtle">
            <IconBrandInstagram size={18} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Container>

      {/* Disclaimer Section */}
      <div className={classes.disclaimer}>
        FOR DEMONSTRATION ONLY. Fulda University of Applied Sciences Software Engineering Project, Fall 2024.
      </div>
    </footer>
  );
}