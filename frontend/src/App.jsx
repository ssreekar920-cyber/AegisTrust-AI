import React, { useState } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import StatusBar from "./components/StatusBar.jsx";
import Home from "./pages/Home.jsx";
import Chatbot from "./pages/Chatbot.jsx";
import MalwareScanner from "./pages/MalwareScanner.jsx";
import PrivacyVault from "./pages/PrivacyVault.jsx";
import ConnectedApps from "./pages/ConnectedApps.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import Auth from "./pages/Auth.jsx";
import IncidentModal from "./components/forensics/IncidentModal.jsx";
import SpaceBackground from "./components/ui/SpaceBackground.jsx";
import PageTransition from "./components/ui/PageTransition.jsx";
import Spinner from "./components/ui/Spinner.jsx";

export function App() {
  const { user, token, loading } = useAuth();
  const [activePage, setActivePage] = useState("home");
  const [forensicsModal, setForensicsModal] = useState({
    isOpen: false,
    incidentId: null,
    threatId: null,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-3 text-cyan-400 font-mono text-sm relative">
        <SpaceBackground interactive={false} />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <span>Authenticating AegisTrust Zero-Trust Gateway...</span>
        </div>
      </div>
    );
  }

  // If user navigated to auth, or is unauthenticated and clicked a protected feature
  if ((!token || !user) && activePage === "auth") {
    return (
      <div className="relative min-h-screen">
        <SpaceBackground />
        <div className="relative z-10">
          <Auth onCancel={() => setActivePage("home")} />
        </div>
      </div>
    );
  }

  const handleNavigate = (page) => {
    // "home" and "about" are publicly accessible for evaluators and visitors
    if (!token && page !== "home" && page !== "about") {
      setActivePage("auth");
      return;
    }
    setActivePage(page);
  };

  const handleOpenForensics = (incidentId, threatId) => {
    setForensicsModal({
      isOpen: true,
      incidentId: incidentId || null,
      threatId: threatId || null,
    });
  };

  const handleCloseForensics = () => {
    setForensicsModal({
      isOpen: false,
      incidentId: null,
      threatId: null,
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-[#e2e8f0] flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300 relative">
      {/* High-Performance Canvas Space, Milky Way & Starfield Motion Graphics */}
      <SpaceBackground />

      {/* Top Futuristic Cyber Dock (Taskbar) */}
      <Navbar activePage={activePage} setActivePage={handleNavigate} />

      {/* Spaceship HUD Telemetry Command Bar */}
      <StatusBar />

      {/* Main Content Pages with Per-Page Unique Transitions */}
      <main className="relative z-10 flex-1 pb-16">
        <PageTransition page={activePage}>
          {activePage === "home" && <Home onNavigate={handleNavigate} />}
          {activePage === "about" && <AboutUs onNavigate={handleNavigate} />}
          {activePage === "chatbot" && <Chatbot />}
          {activePage === "scanner" && (
            <MalwareScanner onConsultChatbot={() => handleNavigate("chatbot")} />
          )}
          {activePage === "privacy" && <PrivacyVault />}
          {activePage === "apps" && (
            <ConnectedApps onInspectIncident={(incId, thId) => handleOpenForensics(incId, thId)} />
          )}
          {activePage === "dashboard" && (
            <Dashboard onInspectIncident={(incId, thId) => handleOpenForensics(incId, thId)} />
          )}
        </PageTransition>
      </main>

      {/* Forensic Audit & AI Auto-Patch Modal */}
      <IncidentModal
        isOpen={forensicsModal.isOpen}
        onClose={handleCloseForensics}
        incidentId={forensicsModal.incidentId}
        threatId={forensicsModal.threatId}
      />
    </div>
  );
}

export default App;
