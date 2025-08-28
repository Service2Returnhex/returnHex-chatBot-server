"use client";
import Head from "next/head";
import { useEffect, useState } from "react";

export default function PromptGuide() {
  const [pageName, setPageName] = useState("");
  const [pageContact, setPageContact] = useState("");
  const [wordLimit, setWordLimit] = useState(100);
  const [offerText, setOfferText] = useState("");

  const makePoints = (wl = 100, offer = "") => [
    {
      id: 1,
      text: `প্রতিটি উত্তর সর্বোচ্চ ${wl} শব্দ হবে — সংক্ষিপ্ত, সরাসরি ও গ্রাহক-কেন্দ্রিক।`,
      enabled: true,
    },
    {
      id: 2,
      text: 'নতুন গ্রাহক হলে প্রথমবার অভিবাদন করুন: "আসসালামু আলাইকুম!"',
      enabled: true,
    },
    {
      id: 3,
      text: "কাস্টমারের প্রশ্ন অনুযায়ী শুধুমাত্র ব্যবসার প্রোডাক্ট/সার্ভিস সম্পর্কিত তথ্য দিন।",
      enabled: true,
    },
    {
      id: 4,
      text: `নতুন গ্রাহককে প্রথমবারে এই অফারটি জানান: "${offer}"`,
      enabled: false,
    },
    {
      id: 5,
      text: "গ্রাহক আগেই একই প্রশ্ন করেছেন এবং তাকে আগেই উত্তর দেওয়া হয়েছে — সেই একই তথ্য আর পুনরায় দেবেন না।\n আগের গ্রাহকের দেওয়া প্রয়োজনীয় তথ্য (যা আমাদের জন্য দরকার) গ্রাহকের কাছে দেখিয়ে যাচাই করুন।  \n গ্রাহক যদি বলেন “ঠিক আছে” অথবা “টিক আছে”, তাহলে পরবর্তী ধাপে এগুন।  \nপ্রয়োজনে বলুন: “এই তথ্য আগেই পাঠানো হয়েছে; আরও কিছু চান?”",
      enabled: true,
    },
    {
      id: 6,
      text: "যদি গ্রাহক অফারে আগ্রহ দেখায় এবং নাম/ফোন না থাকে, বলুন:দয়া করে আপনার নাম ও WhatsApp নম্বর দিন। \nআমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবে। দয়া করে আপনার (প্রয়োজনীয় তথ্য) দিন।",
      enabled: true,
    },
    {
      id: 7,
      text: 'গ্রাহক যখন নাম ও WhatsApp দিবে, দ্রুত বলুন: "ধন্যবাদ! আমাদের প্রতিনিধি শীঘ্রই আপনার WhatsApp নম্বর এ যোগাযোগ করবে।"',
      enabled: true,
    },
    {
      id: 8,
      text: "গ্রাহক যদি সংক্ষিপ্ত স্বীকৃতি (ok/thanks/ধন্যবাদ) লিখে তবে একই ভাষায় ফরমালি ধন্যবাদ জানান।",
      enabled: true,
    },
    {
      id: 9,
      text: "সবসময় বন্ধুত্বপূর্ণ ও প্রফেশনাল টোন বজায় রাখুন।",
      enabled: true,
    },
  ];

  const [points, setPoints] = useState(() => makePoints(wordLimit, offerText));
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!pageName) return;
    try {
      const saved = localStorage.getItem(`ap_system_config_${pageName}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setWordLimit(parsed.wordLimit || 100);
        setOfferText(parsed.offerText || "");
        setPageContact(parsed.pageContact || "");
        if (parsed.points && Array.isArray(parsed.points)) {
          const base = makePoints(
            parsed.wordLimit || 100,
            parsed.offerText || ""
          );
          const newPoints = base.map((p) => ({
            ...p,
            enabled: !!parsed.points.find(
              (sp: any) => sp.id === p.id && sp.enabled
            ),
          }));
          setPoints(newPoints);
        } else {
          setPoints(
            makePoints(parsed.wordLimit || 100, parsed.offerText || "")
          );
        }
        showToast("কনফিগ লোড করা হয়েছে");
      }
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageName]);

  const showToast = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(""), 2500);
  };

  const togglePoint = (id: number) => {
    setPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const applyInputsToPoints = () => {
    const base = makePoints(wordLimit, offerText);
    const newPoints = base.map((p) => {
      const existing = points.find((ep) => ep.id === p.id);
      return { ...p, enabled: existing ? existing.enabled : true };
    });
    setPoints(newPoints);
    showToast("ইনপুট প্রম্পটে যুক্ত করা হয়েছে");
  };

  // Build plain-text prompt (for copying)
  const buildSystemPromptText = () => {
    const page = pageName || "[Page Name]";
    const contactLabel = pageContact ? pageContact : "[Page Contact]";
    const selectedLines = points
      .filter((p) => p.enabled)
      .map((p, idx) => `${idx + 1}. ${p.text}`);
    const joined = selectedLines.join("\n");
    return `আপনি ${page} পেজের AI কাস্টমার সাপোর্ট সহকারী। পেজের যোগাযোগ: ${contactLabel}\n\nনিচে নিয়মসমূহ (শুধু নির্বাচিতগুলো সিস্টেম প্রম্পটের অংশ হবে):\n${joined}\n\nঅফার: ${offerText} (নতুন গ্রাহক প্রথমবারে অবহিত করবেন)।`;
  };

  // Build JSX preview: ordered list with each item on its own line
  const buildSystemPromptJSX = () => {
    const page = pageName || "[Page Name]";
    const contactLabel = pageContact ? pageContact : "[Page Contact]";
    const selected = points.filter((p) => p.enabled);
    return (
      <div>
        <div className="mb-2">
          আপনি <strong>{page}</strong> পেজের AI কাস্টমার সাপোর্ট সহকারী। পেজের
          যোগাযোগ: <strong>{contactLabel}</strong>
        </div>

        <div className="mb-2">
          নিচে নিয়মসমূহ (শুধু নির্বাচিতগুলো সিস্টেম প্রম্পটের অংশ হবে):
        </div>

        <ol className="list-decimal pl-6 space-y-2 text-sm">
          {selected.map((p, idx) => (
            <li key={p.id} className="leading-relaxed">
              {p.text}
            </li>
          ))}
        </ol>

        <div className="mt-4">
          অফার: <strong>{offerText}</strong> (নতুন গ্রাহক প্রথমবারে অবহিত
          করবেন)।
        </div>
      </div>
    );
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("কপি করা হয়েছে");
    } catch (e) {
      showToast("কপি ব্যর্থ");
    }
  };

  const saveConfig = () => {
    if (!pageName) {
      showToast("Page name দিন");
      return;
    }
    const payload = {
      pageName,
      pageContact,
      wordLimit,
      offerText,
      points: points.map((p) => ({ id: p.id, enabled: p.enabled })),
    };
    try {
      localStorage.setItem(
        `ap_system_config_${pageName}`,
        JSON.stringify(payload)
      );
      showToast("কনফিগ সংরক্ষণ করা হয়েছে");
    } catch (e) {
      showToast("সেভ করা যায়নি");
    }
  };

  const resetToDefaults = () => {
    setPoints(makePoints(100, "৩ দিনের ফ্রি ট্রায়াল"));
    setWordLimit(100);
    setOfferText("৩ দিনের ফ্রি ট্রায়াল");
    setPageContact("");
    showToast("ডিফল্ট সেট করা হয়েছে");
  };

  return (
    <div className="min-h-screen bg-radial-aurora py-8 px-4 w-full">
      <Head>
        <title>Multi-tenant Prompt Guide — Beginner Friendly</title>
        <meta
          name="description"
          content="Beginner friendly multi-tenant prompt guide. Fill Page Name, Contact, Word Limit and Offer Text then click Apply to inject them into the system prompt."
        />
      </Head>

      <main className="max-w-4xl mx-auto bg-gradient-to-b from-white/5 to-white/2   border border-white/50 filter bg-blur-xl  backdrop-blur-xl transition-transform  rounded-2xl shadow p-6 text-white">
        {/* e-commerce — detailed intro (uses pageName & pageContact if available) */}
        <section className="card-bg p-4 rounded-2xl mb-6  text-white">
          <h3 className="font-semibold text-lg bg-gradient-to-r from-indigo-300 to-purple-800 bg-clip-text text-transparent">
            কেন সঠিক প্রম্পট দিতে হবে?
          </h3>
          <p className="mt-2 ">
            সঠিক প্রম্পট AI-কে বলে দেয় আপনি কী চান — যেমন: প্রশ্ন, প্রয়োজনীয়
            আইডি/সংখ্যা, এবং কেমন আউটপুট চান (সংক্ষিপ্ত/ধাপে ধাপে/তালিকা)। এটা
            দিলে উত্তর দ্রুত, নির্ভুল ও মানবসম্মত হয়, এবং গ্রাহক সেবা আরও ভালো
            হয়।
          </p>

          <ul className="mt-3 list-disc pl-5 text-sm text-gray-100 space-y-1">
            <li>
              <strong>দ্রুত ও প্রাসঙ্গিক উত্তর:</strong> গ্রাহককে অপ্রয়োজনীয়
              তথ্য না দিয়ে সোজা উত্তর।
            </li>
            <li>
              <strong>কম ভুল বোঝাবুঝি:</strong> সংখ্যা/অর্ডার আইডি/প্রোডাক্ট কোড
              দিলে AI সঠিক রেকর্ড খুঁজে দেবে।
            </li>
            <li>
              <strong>মানব-সদৃশ টোন:</strong> পরিষ্কার টোন ও ভদ্রতা বজায় রেখে
              উত্তর দেয় — যা বিক্রয় বৃদ্ধি করতে সাহায্য করে।
            </li>
          </ul>

          <p className="mt-3 text-sm text-gray-200">
            টিপ: প্রম্পটে অন্তত ১) উদ্দেশ্য, ২) প্রোডাক্ট আইডি বা সংখ্যা (যদি
            থাকে), ৩) আপনি কেমন আউটপুট চান (শর্ট, স্টেপ-বাই-স্টেপ, তালিকা)
            দেবেন।
          </p>
          <p className="mt-3 text-sm text-gray-200">
            টিপ: নিচের কপি-রেডি টেমপ্লেটগুলো ব্যবহার করুন — আপনার `
            {pageName || "পেজ"}` ও `{pageContact || "Contact"}` যোগ করলে AI আরও
            কাস্টমাইজড উত্তর দেবে।
          </p>
        </section>

        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Prompt Guide</h1>
          <p className="mt-2 ">
            Page Name ও Page Contact (WhatsApp), Max words এবং Offer লিখুন —
            তারপর <strong>Apply</strong> চাপুন। ইনপুটগুলো সিস্টেম প্রম্পটে যোগ
            হবে।
          </p>
        </header>

        <section className="mb-6">
          {/* Inputs: stack on xs, 3 columns on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              placeholder="Page Name (উদাহরণ: Shop Bd)"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
              aria-label="Page Name"
            />

            <input
              value={pageContact}
              onChange={(e) => setPageContact(e.target.value)}
              placeholder="Page Contact (WhatsApp)"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
              aria-label="Page Contact"
            />

            <input
              type="number"
              min={10}
              max={500}
              value={wordLimit}
              onChange={(e) => setWordLimit(Number(e.target.value))}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Max words per reply"
              aria-label="Max words per reply"
            />

            {/* Offer spans two columns on larger screens; becomes full width on mobile */}
            <div className="sm:col-span-2">
              <input
                value={offerText}
                onChange={(e) => setOfferText(e.target.value)}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Offer text shown to new customers"
                aria-label="Offer text"
              />
            </div>

            <div className="sm:col-span-1" />
          </div>

          {/* Action buttons: responsive grid — stack on xs, flow into multiple columns on wider screens */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            <button
              onClick={applyInputsToPoints}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:scale-105 transition-transform duration-150 shadow-2xl focus:outline-none focus:ring-2 focus:ring-green-300 hover:shadow-green-600 cursor-pointer"
              aria-label="Apply inputs to prompt"
            >
              Apply
            </button>

            <button
              onClick={saveConfig}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:scale-105 transition-transform duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 hover:shadow-indigo-600 cursor-pointer"
              aria-label="Save config"
            >
              Save Config
            </button>

            <button
              onClick={() => {
                setPoints(points.map((p) => ({ ...p, enabled: true })));
                showToast("All enabled");
              }}
              className="w-full px-4 py-2 border rounded hover:bg-gray-50 hover:text-black cursor-pointer transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-label="Select all"
            >
              Select All
            </button>

            <button
              onClick={() => {
                setPoints(points.map((p) => ({ ...p, enabled: false })));
                showToast("All cleared");
              }}
              className="w-full px-4 py-2 border rounded hover:bg-gray-50 hover:text-black cursor-pointer transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-label="Clear all"
            >
              Clear All
            </button>

            <button
              onClick={resetToDefaults}
              className="w-full px-4 py-2 border rounded hover:bg-gray-50 hover:text-black cursor-pointer transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-label="Reset defaults"
            >
              Reset Defaults
            </button>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-medium">
            নির্বাচনযোগ্য সিস্টেম প্রম্পট নিয়ম (ক্লিক করে অন্তর্ভুক্ত করুন)
          </h2>
          <p className="text-sm  mt-1">
            প্রতি নিয়মনিষ্ঠ বর্গে ক্লিক করলে সেটি সিস্টেম প্রম্পটের অংশ হবে।
          </p>

          <div className="mt-3 grid gap-2">
            {points.map((p) => (
              <label
                key={p.id}
                className="flex items-start gap-3 p-3 border border-gray-800 rounded-lg card-bg"
              >
                <input
                  type="checkbox"
                  checked={p.enabled}
                  onChange={() => togglePoint(p.id)}
                  className="mt-1"
                  aria-label={`Toggle point ${p.id}`}
                />
                <div className="text-sm whitespace-pre-wrap">{p.text}</div>
              </label>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-medium">System Prompt Preview (বাংলা)</h2>
          <p className="text-sm text-gray-200 mt-1">
            নিচে প্রদর্শিত টেক্সটটি কপি করে আপনার AI সিস্টেমে পেস্ট করুন —
            প্রত্যেক নিয়ম আলাদা লাইনে দেখানো হয়েছে।
          </p>

          <div className="mt-3 card-bg p-4 rounded-2xl text-sm whitespace-pre-wrap">
            {buildSystemPromptJSX()}
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => copyText(buildSystemPromptText())}
              className="px-3 py-2 rounded bg-gradient-to-r from-indigo-600 to-blue-600 cursor-pointer hover:scale-105"
            >
              Copy প্রম্পট
            </button>
          </div>
        </section>

        <footer className="mt-6 text-sm text-gray-200">
          Beginner-friendly Multi-tenant Prompt Guide — Apply injects your
          inputs into the prompt points and preview. Save config to persist per
          page.
        </footer>

        {toast && (
          <div className="fixed right-6 bottom-6 bg-black text-white px-4 py-2 rounded shadow">
            {toast}
          </div>
        )}
      </main>
    </div>
  );
}
