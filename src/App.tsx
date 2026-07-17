import { useEffect, useState } from "react";
import { MissionGame } from "./components/MissionGame";
import { AssetGallery } from "./components/debug/AssetGallery";
import { StartScreen } from "./components/StartScreen";
import {
  createMissionDraft,
  deleteSavedMission,
  loadMissionSummaries,
  loadSavedMission,
  type ActiveMission,
} from "./missionStorage";
import { warmGameImageCache } from "./preloadImages";

export function App() {
  if (import.meta.env.DEV && window.location.pathname === "/debug/assets") {
    return <AssetGallery />;
  }
  return <GameApp />;
}

function GameApp() {
  const [missions, setMissions] = useState(() => loadMissionSummaries());
  const [activeMission, setActiveMission] = useState<ActiveMission | null>(null);

  useEffect(() => {
    void warmGameImageCache().catch((error: unknown) => console.error(error));
  }, []);

  function startMission() {
    setActiveMission(createMissionDraft());
  }

  function continueMission(id: string) {
    setActiveMission(loadSavedMission(id));
  }

  function deleteMission(id: string) {
    deleteSavedMission(id);
    setMissions(loadMissionSummaries());
  }

  function returnHome() {
    setMissions(loadMissionSummaries());
    setActiveMission(null);
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement === null) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  }

  if (activeMission !== null) {
    return (
      <MissionGame
        key={activeMission.id}
        mission={activeMission}
        onHome={returnHome}
        onFullscreen={() => void toggleFullscreen()}
      />
    );
  }

  return (
    <StartScreen
      missions={missions}
      onStart={startMission}
      onContinue={continueMission}
      onDelete={deleteMission}
      onFullscreen={() => void toggleFullscreen()}
    />
  );
}
