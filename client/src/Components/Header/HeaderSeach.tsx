import { Autocomplete, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import React from 'react';
import { Link } from "react-router-dom";
import classes from './HeaderSearch.module.css';

const links = [
  { link: '/about', label: 'Features' },
  { link: '/pricing', label: 'Pricing' },
  { link: '/learn', label: 'Learn' },
  { link: '/community', label: 'Community' },
];

export function HeaderSearch() {
  const [opened, { toggle }] = useDisclosure(false);

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={classes.link}
      onClick={(event) => event.preventDefault()}
    >
      {link.label}
    </a>
  ));

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Group>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" />
          <Link to='\'>NeuAnfang</Link>
        </Group>
        <Group>
          <Autocomplete
            className={classes.search}
            style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
            placeholder="Search"
            leftSection={<IconSearch size={16} stroke={1.5} />}
            data={['React', 'Angular', 'Vue', 'Next.js', 'Riot.js', 'Svelte', 'Blitz.js']}
            visibleFrom="xs"
          />
        </Group>

        <Group ml={50} gap={5} className={classes.links} visibleFrom="sm">
            {items}
        </Group>
          
      </div>
    </header>
  );
}