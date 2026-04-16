import { Badge } from "@/components/ui/badge";
import { Database, HardDrive } from "lucide-react";

interface DataSourceBadgeProps {
  usingMockData?: boolean;
}

export function DataSourceBadge({ usingMockData = true }: DataSourceBadgeProps) {
  if (usingMockData) {
    return (
      <Badge variant="secondary" className="gap-1">
        <HardDrive className="w-3 h-3" />
        Demo Mode
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="gap-1 bg-green-500 hover:bg-green-600">
      <Database className="w-3 h-3" />
      Live Data
    </Badge>
  );
}
