export const metadata = {
  title: "오프라인",
};

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <section className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">오프라인 상태입니다</h1>
        <p className="mt-3 text-slate-600">
          인터넷 연결이 복구되면 다시 이용하실 수 있어요.
        </p>
      </section>
    </main>
  );
}
