export interface StatusBarProps {
  staticObjectCount: number;
  dynamicObjectCount: number;
  selectedCount: number;
}

export function StatusBar({
  staticObjectCount,
  dynamicObjectCount,
  selectedCount,
}: StatusBarProps) {
  return (
    <footer className="status-bar">
      <span>Static: {staticObjectCount}</span>
      <span>Dynamic: {dynamicObjectCount}</span>
      <span>Selected: {selectedCount}</span>
    </footer>
  );
}
