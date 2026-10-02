import DynamicBackground from "./components/background";
import ChatAI from "./components/chat";
import Welcome from "./components/welcome";
import ClientAllowedSections from "./components/clientAllowedSections";

export default function Home() {
  return (
    <div className="w-full min-h-0 flex-1 p-8 flex flex-col">
      <DynamicBackground density={3} opacity={1} color="--color-focus-100" direction="right" />
      <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
        <div className="flex flex-col h-full gap-y-3 col-span-2 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden pr-1">
          <Welcome />
          <div className="">
            <ClientAllowedSections />
          </div>
        </div>
        <div className="flex flex-col h-full sticky top-0">
          <ChatAI />
        </div>
      </div>
    </div>
  );
}
