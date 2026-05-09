"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { getGestationalWeek } from "@/lib/utils";
import { Search, Bookmark, Clock, ChevronRight, Play, Filter, X, AlertCircle, Shield, Sparkles } from "lucide-react";
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
  { id: "all", label: "All" }, 
  { id: "warning", label: "Warning Signs" },
  { id: "movement", label: "Baby Movement" },
  { id: "postpartum", label: "Postpartum" },
  { id: "care", label: "Care Preparation" },
  { id: "wellness", label: "Wellness" },
];

const articles: Article[] = [
  { 
    id: "9", 
    title: "Essential Warning Signs", 
    category: "warning", 
    readTime: 3, 
    type: "article", 
    weekRelevance: [1, 44], 
    bookmarked: false, 
    excerpt: "Learn to recognize critical signs that require immediate medical attention for you or your baby.", 
    isEmergency: true,
    content: {
      intro: "Knowing when a symptom might be concerning is a vital part of maternal safety. While many discomforts are common during pregnancy, certain signs should always be evaluated by a healthcare professional.",
      keyPoints: [
        "Trust your instincts: If something feels wrong, seek guidance.",
        "Your healthcare provider is your best resource for individual concerns.",
        "Knowing your 'baseline' helps you spot changes earlier."
      ],
      whenToSeekCare: [
        "Sudden, severe headache or vision changes",
        "Heavy bleeding or fluid leaking (gush)",
        "Fever of 100.4°F (38°C) or higher",
        "Significant decrease in baby's movement patterns",
        "Chest pain or sudden shortness of breath",
        "Severe nausea, vomiting, or persistent abdominal pain",
        "Thoughts of harming yourself or your baby"
      ]
    }
  },
  { 
    id: "10", 
    title: "Understanding Preeclampsia", 
    category: "warning", 
    readTime: 5, 
    type: "article", 
    weekRelevance: [20, 42], 
    bookmarked: false, 
    excerpt: "Why monitoring blood pressure and headaches after 20 weeks is important.",
    content: {
      intro: "Preeclampsia is a condition related to high blood pressure that can occur after 20 weeks of pregnancy or in the postpartum period.",
      keyPoints: [
        "It can happen even if your blood pressure was normal before.",
        "Monitoring for symptoms is as important as BP checks.",
        "Early recognition helps your care team manage it safely."
      ],
      whenToSeekCare: [
        "Severe headache that doesn't improve with rest",
        "Blurry vision, seeing spots, or sensitivity to light",
        "Sudden swelling in your face or around your eyes",
        "Intense pain in the upper right side of your abdomen"
      ]
    }
  },
  { 
    id: "11", 
    title: "Tracking Baby's Movement", 
    category: "movement", 
    readTime: 4, 
    type: "article", 
    weekRelevance: [26, 40], 
    bookmarked: false, 
    excerpt: "How to monitor your baby's activity patterns and what to notice.",
    content: {
      intro: "Feeling your baby move is a reassuring sign of their well-being and a special way to connect during your journey.",
      keyPoints: [
        "Movements usually become more predictable between 26-28 weeks.",
        "Notice the times of day your baby is most active.",
        "Babies have regular sleep cycles and wake periods."
      ],
      whenToSeekCare: [
        "You notice a significant decrease in your baby's usual activity",
        "You feel fewer than 10 movements over a 2-hour period while resting",
        "The intensity of movements feels significantly weaker than your baseline"
      ]
    }
  },
  { 
    id: "4", 
    title: "Postpartum Warning Signs", 
    category: "postpartum", 
    readTime: 4, 
    type: "article", 
    weekRelevance: [38, 44], 
    bookmarked: false, 
    excerpt: "Urgent symptoms to watch for in the weeks following delivery.",
    content: {
      intro: "Safety doesn't end with delivery. The weeks following birth are a critical time for monitoring your recovery.",
      keyPoints: [
        "Postpartum complications can arise up to 6 weeks after birth.",
        "Rest is essential, but stay aware of how you feel physically and mentally.",
        "Keep your follow-up appointments even if you feel well."
      ],
      whenToSeekCare: [
        "Very heavy bleeding (soaking more than one pad an hour)",
        "Severe, persistent headache or vision changes",
        "Fever of 100.4°F or higher",
        "Difficulty breathing or chest pain",
        "Swelling, redness, or pain in one leg"
      ]
    }
  },
  { 
    id: "5", 
    title: "When to Call Your Provider", 
    category: "care", 
    readTime: 5, 
    type: "article", 
    weekRelevance: [1, 44], 
    bookmarked: false, 
    excerpt: "Guidelines for when to reach out for non-emergency but important concerns.",
    content: {
      intro: "Your care team is there to support you. Knowing when to call can help address concerns before they become urgent.",
      keyPoints: [
        "Don't worry about 'bothering' your provider with questions.",
        "Keep a list of non-urgent questions for your scheduled visits.",
        "Call if you notice changes that persist or worsen over time."
      ],
      whenToSeekCare: [
        "Changes in vaginal discharge or unusual odors",
        "Mild but persistent abdominal discomfort",
        "Burning or pain during urination",
        "Concerns about baby's behavior or feeding patterns"
      ]
    }
  },
  { 
    id: "6", 
    title: "Understanding Swelling", 
    category: "warning", 
    readTime: 4, 
    type: "article", 
    weekRelevance: [20, 44], 
    bookmarked: false, 
    excerpt: "Distinguishing between normal pregnancy swelling and signs that need attention.",
    content: {
      intro: "Some swelling is common in pregnancy, but certain patterns can be a sign of underlying issues.",
      keyPoints: [
        "Mild swelling in feet and ankles is often normal, especially at the end of the day.",
        "Elevating your feet and staying hydrated can help with normal swelling.",
        "Sudden or asymmetrical swelling should always be reported."
      ],
      whenToSeekCare: [
        "Sudden swelling in your hands or face",
        "Swelling in only one leg, especially if accompanied by pain or redness",
        "Swelling that is accompanied by a severe headache or vision changes"
      ]
    }
  },
  { 
    id: "7", 
    title: "Your Emergency Care Plan", 
    category: "care", 
    readTime: 6, 
    type: "article", 
    weekRelevance: [1, 44], 
    bookmarked: false, 
    excerpt: "Steps to take now so you are prepared if an urgent situation arises.",
    content: {
      intro: "Being prepared can help you stay calm and act quickly if you ever face a medical emergency.",
      keyPoints: [
        "Keep your provider's after-hours number saved in your phone.",
        "Know the location of your nearest emergency care center.",
        "Have a plan for transportation and childcare if needed urgently."
      ],
      whenToSeekCare: [
        "Review your plan with your partner or support person today",
        "Ensure you have a 'go-bag' ready as you approach your due date"
      ]
    }
  },
  { 
    id: "12", 
    title: "The Fourth Trimester", 
    category: "postpartum", 
    readTime: 6, 
    type: "article", 
    weekRelevance: [37, 44], 
    bookmarked: false, 
    excerpt: "Recovery guidance and mental health awareness for the weeks after birth.",
    content: {
      intro: "The postpartum period is a time of major physical and emotional transition.",
      keyPoints: [
        "Physical healing takes time—be patient with your body.",
        "Mental health is just as important as physical recovery.",
        "Social support is vital during this transition."
      ],
      whenToSeekCare: [
        "Extreme sadness or anxiety that interferes with daily life",
        "Thoughts of harming yourself or your baby",
        "Difficulty bonding with your baby or feeling persistently overwhelmed"
      ]
    }
  },
  { 
    id: "2", 
    title: "Wellness & Hydration", 
    category: "wellness", 
    readTime: 5, 
    type: "article", 
    weekRelevance: [1, 44], 
    bookmarked: false, 
    excerpt: "Supporting your body's incredible work through hydration and rest.",
    content: {
      intro: "Simple daily habits can significantly impact how you feel throughout your pregnancy.",
      keyPoints: [
        "Aim for consistent hydration throughout the day.",
        "Listen to your body's signals for rest and activity.",
        "Balanced nutrition supports both you and your baby's growth."
      ],
      whenToSeekCare: [
        "Inability to keep fluids down due to severe nausea",
        "Signs of dehydration like dark urine or extreme thirst"
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
      <Header title="Learn" />
      <main className="pt-20 pb-28 px-5 max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] mb-2 leading-tight">Learn warning signs & next steps</h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
            Simple pregnancy and postpartum education to help you recognize symptoms, prepare questions, and know when to contact a healthcare provider.
          </p>
          <div className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--warm-200)] inline-flex items-center gap-2 shadow-sm">
            <Shield size={14} className="text-[var(--rose-600)]" />
            <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Educational content only · Not medical advice</span>
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
          className="rounded-3xl bg-gradient-to-br from-rose-500 to-rose-600 p-6 mb-8 text-white shadow-xl shadow-rose-500/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertCircle size={80} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <AlertCircle size={18} />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Urgent Warning Signs</span>
            </div>
            <p className="text-sm font-medium leading-relaxed mb-5 text-rose-50">
              Severe headache, vision changes, heavy bleeding, fever (100.4°F+), or reduced baby movement require prompt medical evaluation.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => router.push("/checkin")}
                className="bg-white text-rose-600 py-2.5 rounded-xl text-xs font-bold shadow-sm active:scale-[0.95] transition-all"
              >
                Start Check-in
              </button>
              <button 
                onClick={() => router.push("/safety")}
                className="bg-rose-400/30 border border-white/30 text-white py-2.5 rounded-xl text-xs font-bold active:scale-[0.95] transition-all"
              >
                View Safety Plan
              </button>
            </div>
          </div>
        </motion.div>

        {userWeek > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-gradient-to-r from-[var(--rose-50)] to-[var(--bg-secondary)] p-4 mb-5 border border-[var(--rose-200)]/40 flex items-center gap-3">
            <Filter size={16} className="text-[var(--rose-500)] flex-shrink-0" />
            <p className="text-xs text-[var(--text-secondary)]">Showing content relevant to <span className="font-semibold text-[var(--rose-700)]">Week {userWeek}</span> first</p>
          </motion.div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-8">
          {sortedArticles.map((article, index) => {
            const isRelevant = article.weekRelevance && userWeek >= article.weekRelevance[0] && userWeek <= article.weekRelevance[1];
            const categoryLabel = categories.find(c => c.id === article.category)?.label || article.category;
            
            return (
              <motion.button 
                key={article.id} 
                initial={{ opacity: 0, y: 16 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.05 }} 
                onClick={() => handleArticleOpen(article)} 
                className={`text-left rounded-3xl p-5 shadow-sm border active:scale-[0.98] transition-all relative overflow-hidden ${
                  article.isEmergency 
                    ? "bg-rose-50/50 border-rose-200" 
                    : "bg-white border-[var(--warm-200)]"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${
                    article.isEmergency 
                      ? "bg-rose-100 text-rose-600" 
                      : article.type === "video" 
                        ? "bg-rose-50 text-rose-500" 
                        : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]"
                  }`}>
                    {article.isEmergency ? <AlertCircle size={24} /> : article.type === "video" ? <Play size={24} /> : <Bookmark size={24} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-[var(--text-primary)] text-[16px] leading-tight">{article.title}</h3>
                      <button onClick={(e) => { e.stopPropagation(); toggleBookmark(article.id); }} className="p-1 -mr-1"><Bookmark size={18} className={bookmarkedIds.has(article.id) ? "text-[var(--rose-500)] fill-[var(--rose-500)]" : "text-[var(--warm-300)]"} /></button>
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-3 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                        isRelevant 
                          ? "bg-rose-100 text-rose-700 border-rose-200" 
                          : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--warm-200)]"
                      }`}>
                        {categoryLabel}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-medium text-[var(--text-muted)]">
                        <Clock size={10} /> {article.readTime} min read
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[var(--surface-primary)] to-[var(--bg-cream)] rounded-3xl p-6 border border-[var(--warm-200)] shadow-md mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center">
              <Sparkles size={20} className="text-rose-600" />
            </div>
            <h4 className="font-bold text-[var(--text-primary)]">Need help organizing?</h4>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
            Mama Guard Assistant can help you summarize symptoms or prepare questions for your healthcare provider.
          </p>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => router.push("/ai")}
              className="w-full py-3 rounded-2xl bg-white border border-[var(--warm-200)] text-[var(--text-primary)] text-sm font-bold active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
            >
              Ask Assistant <ChevronRight size={16} />
            </button>
            <button 
              onClick={() => router.push("/checkin")}
              className="w-full py-3 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-sm font-bold active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Start Check-in
            </button>
          </div>
        </motion.div>
        {sortedArticles.length === 0 && <div className="text-center py-16"><Search size={48} className="text-[var(--warm-300)] mx-auto mb-4" /><p className="text-[var(--text-tertiary)] font-medium mb-1">No articles found</p><p className="text-sm text-[var(--text-muted)]">Try adjusting your search or category filter</p></div>}
      </main>
      <BottomNav />
      <AnimatePresence>
        {selectedArticle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={() => setSelectedArticle(null)}>
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 300 }} 
              className="absolute bottom-0 lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 left-0 right-0 bg-[var(--bg-primary)] rounded-t-3xl lg:rounded-3xl max-h-[90vh] lg:max-h-[85vh] w-full lg:max-w-2xl overflow-y-auto shadow-2xl" 
              onClick={(e) => e.stopPropagation()}
            >
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
                      <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-3">Topic Overview</h4>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{selectedArticle.content.intro}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-[var(--warm-200)] shadow-sm">
                      <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-[0.1em] mb-4 border-b border-[var(--warm-100)] pb-2">Key Guidance</h4>
                      <ul className="space-y-3">
                        {selectedArticle.content.keyPoints.map((point, i) => (
                          <li key={i} className="flex gap-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100 shadow-sm">
                      <h4 className="text-xs font-bold text-rose-800 uppercase tracking-[0.1em] mb-4 border-b border-rose-200/50 pb-2 flex items-center gap-2">
                        <AlertCircle size={14} /> When to contact provider
                      </h4>
                      <ul className="space-y-3">
                        {selectedArticle.content.whenToSeekCare.map((point, i) => (
                          <li key={i} className="flex gap-3 text-sm text-rose-900 font-semibold leading-relaxed">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-[var(--warm-100)]">
                      <p className="text-[10px] text-[var(--text-muted)] italic leading-tight">
                        This content is provided for educational purposes as part of this early-access tool and is not a substitute for professional medical advice, diagnosis, or treatment.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-sm text-[var(--text-tertiary)]">Detailed content coming soon for this early-access article.</p>
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