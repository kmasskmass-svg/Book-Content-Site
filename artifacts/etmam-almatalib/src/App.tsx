import { Switch, Route, Router as WouterRouter } from "wouter";
import { useEffect } from "react";
import Home from "@/pages/Home";
import Reader from "@/pages/Reader";
import NotFound from "@/pages/not-found";
import { useSettings } from "@/hooks/useSettings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/read/:bookId?" component={Reader} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { settings } = useSettings();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
    document.documentElement.style.fontSize = `${settings.fontSize}px`;
  }, [settings.theme, settings.fontSize]);

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default App;
