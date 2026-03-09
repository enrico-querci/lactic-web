interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
      <p className="text-sm">{message}</p>
    </div>
  );
}
