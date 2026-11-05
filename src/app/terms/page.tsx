import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <header className="border-b border-[#e8e6e1] bg-white">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center">
          <Link href="/" className="font-display text-lg">Fashion Week</Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-20 prose prose-neutral">
        <h1 className="font-display text-3xl">Terms & Conditions</h1>
        <p className="text-[#666]">
          Registration constitutes acceptance of event rules. Tickets are non-transferable without
          organiser approval. The organisers reserve the right to refuse entry, modify the programme,
          or cancel activities. Photography and filming may occur; attendance implies consent for
          reasonable use in event promotion.
        </p>
      </main>
    </div>
  );
}
