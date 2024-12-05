import { Anchor, Autocomplete, Burger, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSearch, IconUserCircle } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import classes from "./Header.module.css";

const links = [
  { link: "/login", label: "Login" },
  { link: "/register", label: "Register" },
];

export function Header() {
  const [opened, { toggle }] = useDisclosure(false);

  const items = links.map((link) => (
    <Link key={link.label} to={link.link} className={classes.link}>
      {link.label}
    </Link>
  ));

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Group>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" />
          <Anchor component={Link} to="/">
            NeuAnfang
          </Anchor>
        </Group>
        <Group>
          <Autocomplete
            className={classes.search}
            style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}
            placeholder="Search"
            leftSection={<IconSearch size={16} stroke={1.5} />}
            data={["React", "Angular", "Vue", "Next.js", "Riot.js", "Svelte", "Blitz.js"]}
            visibleFrom="xs"
          />
        </Group>

        <Group ml={50} gap={5} className={classes.links} visibleFrom="sm">
          {items}
          <IconUserCircle stroke={2} />
        </Group>
      </div>
    </header>
  );
}
