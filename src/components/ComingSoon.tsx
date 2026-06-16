export default function ComingSoon({ title }: { title: string }) {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">{title}</h1>
      <div className="rounded-lg border border-border bg-bg-card p-10 text-center">
        <p className="text-text-muted">该功能即将上线，敬请期待。</p>
      </div>
    </div>
  );
}
