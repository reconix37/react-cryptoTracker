import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type TableSkeletonProps = {
  rows?: number;
};

export function MarketTableSkeleton({ rows = 10 }: TableSkeletonProps) {
  return (
    <Table>
      <TableBody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRow key={index}>
            
            <TableCell className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-4 w-16" />
            </TableCell>

            <TableCell className="text-right">
              <Skeleton className="h-4 w-24 ml-auto" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
