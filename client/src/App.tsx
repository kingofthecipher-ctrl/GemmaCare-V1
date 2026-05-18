import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Triage from "./pages/Triage";
import MedicationTracker from "@/pages/MedicationTracker";
import History from "./pages/History";
import Demo from "./pages/Demo";
import About from "./pages/About";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/triage" component={Triage} />
        <Route path="/medications" component={MedicationTracker} />
        <Route path="/history" component={History} />
        <Route path="/demo" component={Demo} />
        <Route path="/about" component={About} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
