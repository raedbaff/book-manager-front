import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "./components/ui/provider.tsx";
import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { Auth0Provider } from "@auth0/auth0-react";
import { getConfig } from "./config.ts";

const graphql = import.meta.env.VITE_GRAPHQL_URL;

const httpLink = createHttpLink({
  uri: graphql,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("accessToken");
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const config = getConfig();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      <ApolloProvider client={client}>
        <Auth0Provider
          domain={config.domain}
          clientId={config.clientId}
          authorizationParams={{
            redirect_uri: window.location.origin,
            ...(config.audience ? { audience: config.audience } : null),
            scope: "read:current_user update:current_user_metadata",
          }}
        >
          <App />
        </Auth0Provider>
      </ApolloProvider>
    </Provider>
  </StrictMode>
);
