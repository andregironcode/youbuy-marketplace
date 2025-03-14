
import { ProfileHelp } from "@/components/profile/ProfileHelp";
import { ScrollArea } from "@/components/ui/scroll-area";

export const HelpPage = () => {
  return (
    <div className="h-full overflow-hidden">
      <ScrollArea className="h-full">
        <ProfileHelp />
      </ScrollArea>
    </div>
  );
};
