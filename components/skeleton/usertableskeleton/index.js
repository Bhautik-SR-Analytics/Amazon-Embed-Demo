import { Skeleton } from "@/components/ui/skeleton";

export default function UserTableSkeleton({ count }) {
  const items = Array.from({ length: count }, (_, i) => i + 1);
  return (
    <div className="space-y-1">
      {items.map((item) => {
        return <Skeleton key={item} className="w-full h-12" />;
      })}
    </div>
  );
}
