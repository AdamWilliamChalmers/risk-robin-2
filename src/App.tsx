import { useState } from "react";
import IntroSplash from "./components/IntroSplash";
import RiskRobinGame from "./components/RiskRobinGame";

export default function App() {
  const [splash, setSplash] = useState<"showing" | "exiting" | "done">(
    "showing"
  );

  const dismissSplash = () => {
    setSplash("exiting");
    window.setTimeout(() => setSplash("done"), 550);
  };

  return (
    <>
      <RiskRobinGame />
      {splash !== "done" && (
        <IntroSplash onEnter={dismissSplash} exiting={splash === "exiting"} />
      )}
    </>
  );
}
