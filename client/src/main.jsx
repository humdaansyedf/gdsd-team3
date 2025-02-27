import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/notifications/styles.css";
import "./index.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./routes";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider
        theme={{
          primaryColor: "green",
          cursorType: "pointer",
        }}
      >
        <Notifications />
        <App />
      </MantineProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
