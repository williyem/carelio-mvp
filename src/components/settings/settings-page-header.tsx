export default function SettingsPageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 space-y-1">
      <h1 className="text-2xl font-bold text-(--text-primary)">{title}</h1>
      <p className="text-sm text-(--text-secondary)">{description}</p>
    </div>
  );
}
