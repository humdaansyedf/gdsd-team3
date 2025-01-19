import { ActionIcon, Anchor, Autocomplete, Burger, Group, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconHome, IconMessage, IconSearch, IconUserCircle, IconHeart } from "@tabler/icons-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth-context";
import classes from "./Header.module.css";

const links = [
  { link: "/login", label: "Login" },
  { link: "/register", label: "Register" },
];

export function Header() {
  const [opened, { toggle }] = useDisclosure(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState([]);

  const items = links.map((link) => (
    <Link key={link.label} to={link.link} className={classes.link}>
      {link.label}
    </Link>
  ));

  const handleSearch = (value) => {
    if (value.trim() !== "") {
      const query = value.trim().replace(/\s+/g, "+");

      setSearchData((prevSearchData) => {
        const updatedSearchData = [...prevSearchData];
        if (!updatedSearchData.includes(value)) {
          updatedSearchData.push(value);
        }
        return updatedSearchData;
      });

      navigate(`/?title=${query}`);
    }
  };

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
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
            placeholder="Search"
            leftSection={<IconSearch size={16} stroke={1.5} />}
            data={searchData}
            visibleFrom="xs"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch(event.target.value);
              }
            }}
          />
        </Group>

        <Group ml={50} gap={10} className={classes.links} visibleFrom="sm">
          {user ? (
            <>
              {user.type === "STUDENT" && (
                <ActionIcon size="md" variant="subtle" component={Link} to="/wishlist">
                  <IconHeart />
                </ActionIcon>
              )}

              <ActionIcon size="md" variant="subtle" component={Link} to="/mymessages">
                <IconMessage />
              </ActionIcon>

              <ActionIcon size="md" variant="subtle" component={Link} to="/dashboard">
                <IconHome />
              </ActionIcon>

              <ActionIcon size="md" variant="subtle" component={Link} to="/profile">
                <IconUserCircle />
              </ActionIcon>
            </>
          ) : (
            items
          )}
        </Group>
      </div>
    </header>
  );
}
