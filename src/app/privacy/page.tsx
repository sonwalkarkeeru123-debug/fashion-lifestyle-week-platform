import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <header className="border-b border-[#e8e6e1] bg-white">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center">
          <Link href="/" className="font-display text-lg">Fashion Week</Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-20 prose prose-neutral">
        <h1 className="font-display text-3xl">Privacy Policy</h1>
        <p className="text-[#666]">
          We collect registration information (name, email, phone, organisation) solely for event
          management, ticketing, and communication. Data is stored securely and is not sold to third
          parties. QR codes contain only anonymous verification tokens. Contact the organiser to
          request data deletion.
        </p>
      </main>
    </div>
  );
}
