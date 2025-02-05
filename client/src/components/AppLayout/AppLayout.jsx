import { Anchor, AppShell, Autocomplete, Burger, Button, Group, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconHeart, IconLayoutGrid, IconMessage, IconSearch, IconUserCircle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth-context";
import classes from "./AppLayout.module.css";

export function AppLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opened, { toggle }] = useDisclosure();

  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const storedSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(storedSearches);
  }, []);

  const handleSearch = (value) => {
    if (value.trim() !== "") {
      const query = value.trim().replace(/\s+/g, "+");

      // Save search to recent searches (keep only 5)
      const updatedSearches = [value, ...recentSearches.filter((s) => s !== value)].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
      setRecentSearches(updatedSearches);

      navigate(`/?title=${query}`);
    }
  };

  return (
    <>
      <AppShell
        header={{ height: 80 }}
        navbar={{ width: 300, breakpoint: "sm", collapsed: { desktop: true, mobile: !opened } }}
        padding="md"
      >
        <AppShell.Header>
          <Group px="md" className={classes.disclaimer}>
            <p>FOR DEMONSTRATION ONLY. Fulda University of Applied Sciences Software Engineering Project, Fall 2024.</p>
          </Group>
          <Group px="md" h={50}>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group justify="space-between" style={{ flex: 1 }}>
              <Anchor component={Link} to="/">
                NeuAnfang
              </Anchor>
              <Group gap="xs" visibleFrom="sm">
                {}
                <Autocomplete
                  placeholder="Search"
                  size="xs"
                  data={recentSearches} 
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearch(searchQuery);
                    }
                  }}
                  leftSection={<IconSearch size={16} />}
                />
                
                {user ? (
                  <>
                    <Button
                      component={Link}
                      variant="subtle"
                      size="compact-sm"
                      to="/dashboard"
                      leftSection={<IconLayoutGrid size={16} />}
                    >
                      Dashboard
                    </Button>
                    <Button
                      component={Link}
                      variant="subtle"
                      size="compact-sm"
                      to="/messages"
                      leftSection={<IconMessage size={16} />}
                    >
                      Messages
                    </Button>
                    <Button
                      component={Link}
                      variant="subtle"
                      size="compact-sm"
                      to="/wishlist"
                      leftSection={<IconHeart size={16} />}
                    >
                      Wishlist
                    </Button>
                    <Button
                      component={Link}
                      variant="subtle"
                      size="compact-sm"
                      to="/profile"
                      leftSection={<IconUserCircle size={16} />}
                    >
                      Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <Button component={Link} variant="subtle" size="compact-sm" to="/login">
                      Login
                    </Button>
                    <Button component={Link} variant="subtle" size="compact-sm" to="/register">
                      Register
                    </Button>
                  </>
                )}
              </Group>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar py="md" px={4}>
          <Stack gap={4}>
            {user ? (
              <>
                <Button
                  component={Link}
                  justify="flex-start"
                  variant="subtle"
                  to="/dashboard"
                  leftSection={<IconLayoutGrid />}
                >
                  Dashboard
                </Button>
                <Button
                  component={Link}
                  justify="flex-start"
                  variant="subtle"
                  to="/messages"
                  leftSection={<IconMessage />}
                >
                  Messages
                </Button>
                <Button
                  component={Link}
                  justify="flex-start"
                  variant="subtle"
                  to="/profile"
                  leftSection={<IconUserCircle />}
                >
                  Profile
                </Button>
              </>
            ) : (
              <>
                <Button component={Link} style={{ justifyContent: "flex-start" }} variant="subtle" to="/login">
                  Login
                </Button>
                <Button component={Link} style={{ justifyContent: "flex-start" }} variant="subtle" to="/register">
                  Register
                </Button>
              </>
            )}
          </Stack>
        </AppShell.Navbar>

        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
        <AppShell.Footer></AppShell.Footer>
      </AppShell>
    </>
  );
}
