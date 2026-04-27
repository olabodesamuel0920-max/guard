"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { getGestationalWeek } from "@/lib/utils";
import { Search, Bookmark, Clock, ChevronRight, Play, Filter, X, AlertCircle, Shield } from "lucide-react";
import { safeStorage, STORAGE_KEYS } from "@/lib/storage";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";

interface ArticleContent {
  intro: string;
  keyPoints: string[];
  whenToSeekCare: string[];
}

interface Article { 
  id: string; 
  title: string; 
  category: string; 
  readTime: number; 
  type: "article" | "video"; 
  weekRelevance?: [number, number]; 
  bookmarked: boolean; 
  excerpt: string; 
  isEmergency?: boolean;
  content?: ArticleContent;
}

const categories = [
  { id: "all", label: "All" }, { id: "nutrition", label: "Nutrition" },
  { id: "labor", label: "Labor & Birth" }, { id: "newborn", label: "Newborn Care" },
  { id: "mental", label: "Mental Health" }, { id: "exercise", label: "Exercise" },
  { id: "symptoms", label: "Symptoms" },
];

const articles: Article[] = [
  { 
    id: "9", 
    title: "When to seek Emergency Care", 
    category: "symptoms", 
    readTime: 3, 
    type: "article", 
    weekRelevance: [1, 44], 
    bookmarked: false, 
    excerpt: "Critical signs that require immediate medical attention for you or your baby.", 
    isEmergency: true,
    content: {
      intro: "Knowing when a symptom is an emergency is one of the most important parts of prenatal care. While many discomforts are normal, some signs require immediate intervention.",
      keyPoints: [
        "Trust your instincts: If something feels wrong, seek care.",
        "Emergency departments are always available for pregnancy concerns.",
        "Keep your provider's after-hours number saved."
      ],
      whenToSeekCare: [
        "Vaginal bleeding (bright red or heavy flow)",
        "Severe abdominal pain or constant cramping",
        "Loss of fluid (water breaking before 37 weeks)",
        "Severe headache or vision changes",
        "Significant decrease in fetal movement"
      ]
    }
  },
  { 
    id: "10", 
    title: "Severe Headache & Preeclampsia", 
    category: "symptoms", 
    readTime: 5, 
    type: "article", 
    weekRelevance: [20, 42], 
    bookmarked: true, 
    excerpt: "Why a persistent headache after 20 weeks matters.",
    content: {
      intro: "A severe, persistent headache after 20 weeks of pregnancy can be a sign of Preeclampsia—a serious condition related to high blood pressure.",
      keyPoints: [
        "Preeclampsia can happen even if you've never had high blood pressure.",
        "It can affect your kidneys, liver, and baby's growth.",
        "Early detection and monitoring are key to a safe delivery."
      ],
      whenToSeekCare: [
        "Headache that doesn't go away with rest or hydration",
        "Blurred vision, seeing spots, or light sensitivity",
        "Pain in the upper right abdomen",
        "Sudden swelling in face or around eyes"
      ]
    }
  },
  { 
    id: "11", 
    title: "Monitoring Baby's Movement", 
    category: "symptoms", 
    readTime: 4, 
    type: "article", 
    weekRelevance: [26, 40], 
    bookmarked: false, 
    excerpt: "How to track 'kick counts' and what to look for.",
    content: {
      intro: "Feeling your baby move is a wonderful way to connect and a key indicator of their well-being.",
      keyPoints: [
        "Baby's movements usually become regular around 26-28 weeks.",
        "You don't need to count every kick all day, but notice patterns.",
        "Babies have sleep and wake cycles (often most active at night)."
      ],
      whenToSeekCare: [
        "You notice a significant decrease in your baby's usual activity",
        "You can't feel 10 movements within 2 hours while resting on your side",
        "The movements feel significantly weaker than normal"
      ]
    }
  },
  { 
    id: "1", 
    title: "Prenatal Nutrition Essentials", 
    category: "nutrition", 
    readTime: 5, 
    type: "article", 
    weekRelevance: [1, 40], 
    bookmarked: false, 
    excerpt: "Key nutrients for a healthy pregnancy and how to get them from your diet.",
    content: {
      intro: "Your nutritional needs increase during pregnancy to support your baby's development and your own changing body.",
      keyPoints: [
        "Folic acid is vital for early brain and spine development.",
        "Iron needs double to support increased blood volume.",
        "Calcium and Vitamin D support baby's bone growth."
      ],
      whenToSeekCare: [
        "Severe nausea that prevents you from keeping any food or water down",
        "Sudden loss of appetite or severe fatigue"
      ]
    }
  },
  { 
    id: "12", 
    title: "Postpartum Warning Signs", 
    category: "symptoms", 
    readTime: 6, 
    type: "article", 
    weekRelevance: [37, 44], 
    bookmarked: false, 
    excerpt: "The 'Fourth Trimester' safety guide for new moms.",
    content: {
      intro: "The six weeks following birth (postpartum) are a critical time for your recovery and health.",
      keyPoints: [
        "Your body goes through massive hormonal and physical shifts.",
        "Rest and hydration are just as important now as during pregnancy.",
        "Postpartum preeclampsia can happen even after a healthy delivery."
      ],
      whenToSeekCare: [
        "Heavy bleeding (soaking a pad in an hour)",
        "Fever of 100.4°F or higher",
        "Severe leg pain or swelling (possible blood clot)",
        "Feelings of extreme sadness or thoughts of harming yourself"
      ]
    }
  }
];

export default function LearnPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(articles.filter((a) => a.bookmarked).map((a) => a.id)));

  const getUserWeek = () => { try { const data = safeStorage.get<{ dueDate: string } | null>(STORAGE_KEYS.ONBOARDING, null); if (data) return getGestationalWeek(data.dueDate); } catch { /* ignore */ } return 0; };
  const userWeek = getUserWeek();

  const handleArticleOpen = (article: Article) => {
    setSelectedArticle(article);
    const readIds = safeStorage.get<string[]>(STORAGE_KEYS.ARTICLES_READ, []);
    if (!readIds.includes(article.id)) {
      safeStorage.set(STORAGE_KEYS.ARTICLES_READ, [...readIds, article.id]);
    }
  };

  const toggleBookmark = (id: string) => { setBookmarkedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; }); };

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = activeCategory === "all" || article.category === activeCategory;
    const matchesSearch = !searchQuery || article.title.toLowerCase().includes(searchQuery.toLowerCase()) || article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (!userWeek) return 0;
    const aRelevant = a.weekRelevance && userWeek >= a.weekRelevance[0] && userWeek <= a.weekRelevance[1];
    const bRelevant = b.weekRelevance && userWeek >= b.weekRelevance[0] && userWeek <= b.weekRelevance[1];
    if (aRelevant && !bRelevant) return -1;
    if (!aRelevant && bRelevant) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-cream)]">
      <Header showAssistantButton={false} />
      <main className="pt-20 pb-28 px-5">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Learn</h1>
          <p className="text-sm text-[var(--text-secondary)]">Supportive guidance for your journey</p>
          <div className="mt-4 px-3 py-1.5 rounded-lg bg-[var(--warm-100)] border border-[var(--warm-200)] inline-flex items-center gap-2">
            <Shield size={12} className="text-[var(--text-muted)]" />
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Educational content only — not medical advice</span>
          </div>
        </div>
        <div className="relative mb-5">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search topics..." className="w-full bg-[var(--surface-primary)] border border-[var(--warm-200)] rounded-2xl pl-11 pr-10 py-3.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--rose-400)] focus:outline-none shadow-sm" />
          {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2"><X size={16} className="text-[var(--text-muted)]" /></button>}
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 -mx-1 px-1">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.id ? "bg-[var(--text-primary)] text-white shadow-md" : "bg-[var(--surface-primary)] text-[var(--text-secondary)] border border-[var(--warm-200)]"}`}>
              {activeCategory === cat.id && <div className="w-2 h-2 rounded-full bg-white" />}{cat.label}
            </button>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 p-4 mb-6 text-white shadow-lg shadow-rose-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Emergency Signs</span>
          </div>
          <p className="text-xs font-medium leading-relaxed text-rose-50">
            Severe bleeding, breathing difficulty, seizures, severe headache with vision changes, or reduced baby movement require urgent medical care.
          </p>
        </motion.div>

        {userWeek > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-gradient-to-r from-[var(--rose-50)] to-[var(--bg-secondary)] p-4 mb-5 border border-[var(--rose-200)]/40 flex items-center gap-3">
            <Filter size={16} className="text-[var(--rose-500)] flex-shrink-0" />
            <p className="text-xs text-[var(--text-secondary)]">Showing content relevant to <span className="font-semibold text-[var(--rose-700)]">Week {userWeek}</span> first</p>
          </motion.div>
        )}
        <div className="grid grid-cols-1 gap-4">
          {sortedArticles.map((article, index) => {
            const isRelevant = article.weekRelevance && userWeek >= article.weekRelevance[0] && userWeek <= article.weekRelevance[1];
            return (
              <motion.button key={article.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} onClick={() => handleArticleOpen(article)} className={`text-left rounded-2xl p-4 shadow-md border active:scale-[0.98] transition-transform ${article.isEmergency ? "bg-red-50 border-red-200" : "bg-[var(--surface-primary)] border-[var(--warm-200)]/60"}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${article.isEmergency ? "bg-red-100" : article.type === "video" ? "bg-gradient-to-br from-[var(--rose-100)] to-[var(--rose-200)]" : "bg-gradient-to-br from-[var(--sage-100)] to-[var(--sage-200)]"}`}>{article.isEmergency ? <AlertCircle size={24} className="text-red-600" /> : article.type === "video" ? <Play size={24} className="text-[var(--rose-600)]" /> : <Bookmark size={24} className="text-[var(--sage-600)]" />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-[var(--text-primary)] text-[15px] leading-snug mb-1">{article.title}</h3>
                      <button onClick={(e) => { e.stopPropagation(); toggleBookmark(article.id); }} className="flex-shrink-0"><Bookmark size={18} className={bookmarkedIds.has(article.id) ? "text-[var(--rose-500)] fill-[var(--rose-500)]" : "text-[var(--warm-300)]"} /></button>
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-2 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${isRelevant ? "bg-[var(--rose-100)] text-[var(--rose-700)]" : "bg-[var(--warm-100)] text-[var(--warm-600)]"}`}>{article.category}</span>
                      <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]"><Clock size={11} />{article.readTime} min</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
        {sortedArticles.length === 0 && <div className="text-center py-16"><Search size={48} className="text-[var(--warm-300)] mx-auto mb-4" /><p className="text-[var(--text-tertiary)] font-medium mb-1">No articles found</p><p className="text-sm text-[var(--text-muted)]">Try adjusting your search or category filter</p></div>}
      </main>
      <BottomNav />
      <AnimatePresence>
        {selectedArticle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={() => setSelectedArticle(null)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="absolute bottom-0 left-0 right-0 bg-[var(--bg-primary)] rounded-t-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-[var(--bg-primary)] rounded-t-3xl border-b border-[var(--warm-200)] px-5 py-4 flex items-center justify-between z-10">
                <h2 className="font-bold text-[var(--text-primary)] text-lg pr-4">{selectedArticle.title}</h2>
                <button onClick={() => setSelectedArticle(null)} className="w-8 h-8 rounded-full bg-[var(--warm-100)] flex items-center justify-center flex-shrink-0"><XIcon size={16} className="text-[var(--text-secondary)]" /></button>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--rose-100)] text-[var(--rose-700)]">{selectedArticle.category}</span>
                  <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]"><Clock size={12} />{selectedArticle.readTime} min read</span>
                </div>
                
                {selectedArticle.content ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2">Introduction</h4>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{selectedArticle.content.intro}</p>
                    </div>

                    <div className="bg-[var(--warm-50)] rounded-2xl p-4 border border-[var(--warm-100)]">
                      <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Key Points</h4>
                      <ul className="space-y-2">
                        {selectedArticle.content.keyPoints.map((point, i) => (
                          <li key={i} className="flex gap-2 text-sm text-[var(--text-secondary)]">
                            <span className="text-[var(--rose-500)] font-bold">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
                      <h4 className="text-xs font-bold text-rose-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <AlertCircle size={14} /> When to seek Care
                      </h4>
                      <ul className="space-y-2">
                        {selectedArticle.content.whenToSeekCare.map((point, i) => (
                          <li key={i} className="flex gap-2 text-sm text-rose-900 font-medium">
                            <span className="text-rose-500">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-[var(--warm-100)]">
                      <p className="text-[10px] text-[var(--text-muted)] italic leading-tight">
                        This content is provided for educational purposes as part of this prototype and is not a substitute for professional medical advice, diagnosis, or treatment.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-sm text-[var(--text-tertiary)]">Detailed content coming soon for this prototype article.</p>
                  </div>
                )}
                
                <button onClick={() => toggleBookmark(selectedArticle.id)} className={`w-full mt-8 py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${bookmarkedIds.has(selectedArticle.id) ? "bg-[var(--rose-100)] text-[var(--rose-700)] border-2 border-[var(--rose-300)]" : "bg-[var(--surface-primary)] text-[var(--text-primary)] border-2 border-[var(--warm-200)]"}`}><Bookmark size={16} className={bookmarkedIds.has(selectedArticle.id) ? "fill-current" : ""} />{bookmarkedIds.has(selectedArticle.id) ? "Saved" : "Save for later"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function XIcon({ size, className }: { size?: number; className?: string }) {
  return <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}
