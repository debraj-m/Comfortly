import { useState } from "react";
import Sidebar from "../components/Sidebar";
import UserContent from "../components/UserContent";
import LandingPage from "../pages/LandingPage";
import "./App.css"; 

function App() {
  const [selectedTab, setSelectedTab] = useState("landing");

  const handleClose = () => {
    setSelectedTab("landing");
  };

  return (
    <div className="flex h-screen bg-zinc-900 text-white">
      <Sidebar onSelect={setSelectedTab} />
      <div className="flex-1 overflow-auto relative">
        {selectedTab === "landing" && <LandingPage />}
        {(selectedTab === "profile" || selectedTab === "preference") && (
          <UserContent selected={selectedTab} onClose={handleClose} />
        )}
      </div>
    </div>
  );
}

export default App;
