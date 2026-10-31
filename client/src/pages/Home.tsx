import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import ShoppingSidebar from "@/components/ShoppingSidebar";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ShoppingBag, Users, Star, Truck, Shield, MessageCircle, Newspaper, Globe, FlaskConical, HeartPulse, ThumbsUp, Eye, MessageSquare, BookOpen, Pill, AlertTriangle, FileText, HelpCircle, Clock, ChevronRight, X, Scissors, Droplets, Scale, Leaf, Sparkles, Trophy } from "lucide-react";
import { Link } from "wouter";
import { useMemo, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useSEO } from "@/hooks/useSEO";
import { productHref, proxyImage } from "@/lib/utils";

const HERO_BANNERS = [
  {
    tag: "",
    title: "",
    sub: "",
    href: "/products",
    bg: "from-[#f0e8c4] via-[#ecdfa8] to-[#ddd090]",
    accent: "",
    deco: "",
    decoPos: "",
    image: "/banner-talmoschool.png",
  },
  {
    tag: "인도 직배송 특가",
    title: "탈모 치료제\n직구 1위",
    sub: "피나스테리드, 미녹시딜, 두타스테리드",
    href: "/products?filter=best",
    bg: "from-[#7B6B5A] to-[#A08060]",
    accent: "#F5E6C8",
    deco: "💊",
    decoPos: "bottom-6 right-8 text-[120px] opacity-20",
  },
  {
    tag: "피부미용 전문",
    title: "맑고 탄탄한\n피부의 비밀",
    sub: "트레티노인, 아젤라산, 피부과 성분 직구",
    href: "/products?category=skin-beauty",
    bg: "from-[#5A6B7A] to-[#7A9BB5]",
    accent: "#D6EAF8",
    deco: "✨",
    decoPos: "bottom-4 right-6 text-[110px] opacity-20",
  },
  {
    tag: "건강 보조제",
    title: "건강한 삶을\n위한 선택",
    sub: "비타민, 오메가3, 프로바이오틱스 해외직구",
    href: "/products?category=health",
    bg: "from-[#5A7A5A] to-[#7AAB7A]",
    accent: "#D5F5E3",
    deco: "🌿",
    decoPos: "bottom-4 right-6 text-[110px] opacity-20",
  },
  {
    tag: "회원 전용 혜택",
    title: "등급별 할인\n최대 15%",
    sub: "브론즈·실버·골드·VIP 회원 특별 혜택",
    href: "/bbs/board.php?bo_table=info",
    bg: "from-[#7A5A7A] to-[#9B7AAB]",
    accent: "#E8D5F5",
    deco: "🎁",
    decoPos: "bottom-4 right-6 text-[110px] opacity-20",
  },
];

type BannerSlide = {
  href: string;
  image?: string;
  tag?: string;
  title?: string;
  sub?: string;
  bg?: string;
  accent?: string;
  deco?: string;
  decoPos?: string;
};

function HeroBannerCarousel({ slides }: { slides: BannerSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = slides.length;

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(p => (p + 1) % total);
    }, 3500);
  };

  useEffect(() => {
    setCurrent(0);
  }, [total]);

  useEffect(() => {
    if (!paused) startTimer();
    else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, total]);

  const go = (idx: number) => { setCurrent((idx + total) % total); startTimer(); };

  if (total === 0) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden h-full select-none shadow-lg">
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * (100 / total)}%)`, width: `${total * 100}%` }}
      >
        {slides.map((b, i) => (
          <div
            key={i}
            className={`relative flex-shrink-0 h-full ${b.image ? "bg-[#f0e8c4]" : `bg-gradient-to-br ${b.bg ?? ""}`}`}
            style={{ width: `${100 / total}%` }}
          >
            {b.image ? (
              <Link href={b.href}>
                <img src={b.image} alt="배너" className="w-full h-full object-contain cursor-pointer" draggable={false} />
              </Link>
            ) : (
              <>
                <span className={`absolute ${b.decoPos ?? ""} leading-none pointer-events-none`}>{b.deco}</span>
                <span className="absolute top-4 left-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                  {b.tag}
                </span>
                <div className="relative z-10 p-6 pt-14 flex flex-col justify-end h-full">
                  <h3 className="text-2xl md:text-3xl font-bold text-white leading-snug mb-2 whitespace-pre-line">{b.title}</h3>
                  <p className="text-sm text-white/75 mb-5">{b.sub}</p>
                  <Link href={b.href}>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors backdrop-blur-sm cursor-pointer">
                      바로가기 <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Left arrow */}
      <button
        onClick={() => go(current - 1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors backdrop-blur-sm z-20"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
      </button>
      {/* Right arrow */}
      <button
        onClick={() => go(current + 1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors backdrop-blur-sm z-20"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Bottom controls */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-20">
        <button
          onClick={() => setPaused(p => !p)}
          className="w-6 h-6 rounded-full bg-black/25 hover:bg-black/40 flex items-center justify-center text-white text-[10px] transition-colors backdrop-blur-sm"
        >
          {paused ? "▶" : "⏸"}
        </button>
        <span className="text-[11px] font-semibold text-white/90 bg-black/25 rounded-full px-2 py-0.5 backdrop-blur-sm">
          {current + 1}/{total}
        </span>
        <div className="flex gap-1">
          {slides.map((_, i) => (
            <button key={i} onClick={() => go(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-5 bg-white" : "w-1.5 bg-white/40"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-accent/30 to-secondary/50 overflow-hidden">
      <div className="container py-12 md:py-16">
        <div className="max-w-2xl">
          <Badge variant="secondary" className="mb-4 text-xs font-medium px-3 py-1">커뮤니티 + 쇼핑</Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
            탈모, 피부, 건강을 위한<br />
            <span className="text-primary">해외직구 전문</span> 쇼핑몰
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed">
            인도 의약품 직배송 - 탈모, 성기능, 피부미용, 다이어트 전문 쇼핑몰 WESHOP입니다.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-6">
              <Link href="/products">쇼핑 시작하기 <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-6">
              <Link href="/bbs/board.php?bo_table=info">정보나눔</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesBar() {
  const features = [
    { icon: Truck, label: "해외직구 배송", desc: "인도 직배송" },
    { icon: Shield, label: "상품 비교", desc: "상세 정보 확인" },
    { icon: Star, label: "공개 게시글", desc: "정보와 리뷰 모아보기" },
    { icon: Clock, label: "정보 열람 전용", desc: "주문·결제 미제공" },
  ];
  return (
    <section className="border-b border-border/60">
      <div className="container py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(f => (
            <div key={f.label} className="flex items-center gap-3 py-4 px-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <f.icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductSection({ title, subtitle, queryOpts, viewAllHref }: { title: string; subtitle: string; queryOpts: any; viewAllHref: string }) {
  const { data, isLoading } = trpc.product.list.useQuery(queryOpts);
  return (
    <section className="py-12">
      <div>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <Link href={viewAllHref} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            전체보기 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(data?.products ?? []).slice(0, 5).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        {!isLoading && (data?.products ?? []).length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">아직 등록된 상품이 없습니다</p>
          </div>
        )}
      </div>
    </section>
  );
}

function CommunityPreview() {
  const { data: boards } = trpc.community.boards.useQuery();
  return (
    <section className="py-12 bg-secondary/30">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">커뮤니티</h2>
            <p className="text-sm text-muted-foreground mt-1">회원들과 자유롭게 소통하세요</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(boards ?? []).map(board => (
            <Link key={board.id} href={`/community/${board.slug}`}>
              <div className="bg-card rounded-xl p-5 elegant-shadow hover:elegant-shadow-lg transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {board.boardType === "free" && <Users className="w-5 h-5 text-primary" />}
                    {board.boardType === "review" && <Star className="w-5 h-5 text-primary" />}
                    {board.boardType === "qna" && <MessageCircle className="w-5 h-5 text-primary" />}
                    {board.boardType === "notice" && <ShoppingBag className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{board.name}</h3>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{board.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const NEWS_SECTION_ICONS: Record<string, any> = {
  domestic: Newspaper,
  international: Globe,
  research: FlaskConical,
};

const NEWS_SECTION_LABELS: Record<string, string> = {
  domestic: "국내",
  international: "해외",
  research: "연구",
};

const NEWS_SECTION_COLORS: Record<string, string> = {
  domestic: "bg-blue-100 text-blue-700",
  international: "bg-emerald-100 text-emerald-700",
  research: "bg-purple-100 text-purple-700",
};

function NewsPreviewSection() {
  const { data, isLoading } = trpc.news.latestForHome.useQuery({ limit: 6 });
  const { data: categoriesData } = trpc.category.list.useQuery();

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "방금 전";
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;
    return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  };

  const stripMarkdown = (text: string) => {
    return text
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/`[^`]+`/g, "")
      .replace(/\n/g, " ")
      .trim();
  };

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">건강뉴스</h2>
              <p className="text-sm text-muted-foreground mt-1">카테고리별 최신 건강 뉴스와 연구 정보</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-5 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-br from-blue-50/50 via-white to-emerald-50/50">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">건강뉴스</h2>
            <p className="text-sm text-muted-foreground mt-1">카테고리별 최신 건강 뉴스와 연구 정보</p>
          </div>
          <Link href="/news" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            전체보기 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((news: any) => {
            const SectionIcon = NEWS_SECTION_ICONS[news.newsSection] || Newspaper;
            const categoryName = categoriesData?.find((c: any) => c.id === news.categoryId)?.name;
            return (
              <Link key={news.id} href={`/news/${news.id}`}>
                <div className="bg-card rounded-xl p-5 elegant-shadow hover:elegant-shadow-lg transition-all duration-300 group h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    {news.newsSection && (
                      <Badge variant="secondary" className={`text-xs ${NEWS_SECTION_COLORS[news.newsSection] || ""}`}>
                        {NEWS_SECTION_LABELS[news.newsSection] || news.newsSection}
                      </Badge>
                    )}
                    {categoryName && (
                      <Badge variant="outline" className="text-xs">{categoryName}</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                    {stripMarkdown(news.content).slice(0, 120)}
                  </p>
                  <div className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/50">
                    {formatDate(news.createdAt)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const SECTION_TYPE_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  faq: { icon: HelpCircle, label: "FAQ", color: "bg-blue-100 text-blue-700" },
  usage: { icon: BookOpen, label: "사용방법", color: "bg-green-100 text-green-700" },
  dosage: { icon: Pill, label: "용량/용법", color: "bg-amber-100 text-amber-700" },
  sideEffects: { icon: AlertTriangle, label: "부작용", color: "bg-red-100 text-red-700" },
  precautions: { icon: FileText, label: "주의사항", color: "bg-purple-100 text-purple-700" },
};

function PopularDiscussionsSection() {
  const { data, isLoading } = trpc.discussion.popular.useQuery({ limit: 5 });

  if (isLoading) {
    return (
      <section className="py-12 bg-gradient-to-br from-orange-50/50 via-white to-rose-50/50">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">인기 토론</h2>
              <p className="text-sm text-muted-foreground mt-1">회원들이 가장 활발하게 논의하는 주제</p>
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-br from-orange-50/50 via-white to-rose-50/50">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">인기 토론 Top 5</h2>
            <p className="text-sm text-muted-foreground mt-1">회원들이 가장 활발하게 논의하는 주제</p>
          </div>
          <Link href="/discussions" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            전체보기 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {data.map((d: any, idx: number) => (
            <Link key={d.id} href={`/discussions/${d.id}`}>
              <div className="bg-card rounded-xl p-4 elegant-shadow hover:elegant-shadow-lg transition-all duration-300 group flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                  idx === 0 ? "bg-yellow-100 text-yellow-700" :
                  idx === 1 ? "bg-gray-100 text-gray-600" :
                  idx === 2 ? "bg-orange-100 text-orange-700" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                    {d.isPinned ? <span className="text-primary mr-1">[고정]</span> : null}
                    {d.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{d.displayName || d.userName || "익명"}</span>
                    <span className="flex items-center gap-0.5"><ThumbsUp className="w-3 h-3" />{d.likeCount}</span>
                    <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" />{d.commentCount}</span>
                    <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{d.viewCount}</span>
                  </div>
                </div>
                {d.tags && d.tags.length > 0 && (
                  <div className="hidden md:flex gap-1">
                    {(d.tags as string[]).slice(0, 2).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductInfoHighlightsSection() {
  const { data, isLoading } = trpc.productInfo.highlights.useQuery({ limit: 6 });

  const stripMarkdown = (text: string) => {
    return text
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/`[^`]+`/g, "")
      .replace(/\n/g, " ")
      .trim();
  };

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">상품 정보 하이라이트</h2>
              <p className="text-sm text-muted-foreground mt-1">최근 업데이트된 상품 정보</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-5 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">상품 정보 하이라이트</h2>
            <p className="text-sm text-muted-foreground mt-1">최근 업데이트된 FAQ, 사용방법, 부작용 정보</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((item: any, idx: number) => {
            const config = SECTION_TYPE_CONFIG[item.sectionType] || { icon: FileText, label: item.sectionType, color: "bg-muted text-muted-foreground" };
            const SIcon = config.icon;
            return (
              <Link key={idx} href={`/products/${item.productSlug}?tab=info`}>
                <div className="bg-card rounded-xl p-5 elegant-shadow hover:elegant-shadow-lg transition-all duration-300 group h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className={`text-xs ${config.color}`}>
                      <SIcon className="w-3 h-3 mr-1" />{config.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate">{item.productName}</span>
                  </div>
                  <h3 className="font-semibold text-sm leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                    {stripMarkdown(item.content || "").slice(0, 120)}
                  </p>
                  {item.productImage && (
                    <div className="mt-3 pt-2 border-t border-border/50 flex items-center gap-2">
                      <img src={item.productImage} alt="" className="w-6 h-6 rounded object-cover" />
                      <span className="text-xs text-muted-foreground truncate">{item.productName}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BoardPreviewColumn({ slug, title, href, limit = 5, postLinkFn }: { slug: string; title: string; href: string; limit?: number; postLinkFn?: (post: any) => string }) {
  const { data, isLoading } = trpc.community.recentBySlug.useQuery({ slug, limit });
  const fmtDate = (date: string | Date) => {
    const d = new Date(date);
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}.${mm}.${dd}`;
  };
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold">{title}</h3>
        <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5">
          더보기 <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {(data ?? []).slice(0, 5).map((post: any) => (
            <li key={post.id}>
              <Link href={postLinkFn ? postLinkFn(post) : `/community/post/${post.id}`} className="flex items-center justify-between gap-4 py-4 group">
                <span className="text-sm text-foreground/90 truncate flex-1 group-hover:text-primary transition-colors leading-snug">
                  {post.title}
                </span>
                <span className="text-sm text-muted-foreground shrink-0 tabular-nums">{fmtDate(post.createdAt)}</span>
              </Link>
            </li>
          ))}
          {(!data || data.length === 0) && (
            <li className="text-sm text-muted-foreground py-6 text-center">게시글이 없습니다</li>
          )}
        </ul>
      )}
    </div>
  );
}

function ReviewCard({ post }: { post: any }) {
  const name = post.displayName || (post.userName ?? "익명");
  const stars = Math.min(5, Math.max(1, post.rating ?? 5));
  const productLink = productHref(post.productSlug, post.productItId);
  const dateStr = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, "-").replace(/\.$/, "")
    : "";

  return (
    <article className="shop-soft-card flex flex-col min-w-0 p-5 gap-3 hover:-translate-y-1 transition-transform">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-0.5 items-center" aria-label={`${stars}점 평점`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-3.5 h-3.5 ${i < stars ? "fill-[#2864e8] text-[#2864e8]" : "text-slate-200"}`} />
        ))}
        </div>
        <span className="text-[11px] text-slate-400">{dateStr}</span>
      </div>
      {post.productName && (
        <p className="text-[11px] font-semibold text-primary truncate">{post.productName}</p>
      )}
      <p className="text-base font-bold line-clamp-2 leading-snug text-slate-950">{post.title}</p>
      <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed flex-1">{post.content}</p>
      {post.productThumbnail && post.productSlug && (
        <Link
          href={productLink}
          className="group/product mt-1 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-2"
          aria-label={`${post.productName ?? "상품"} 상세 보기`}
        >
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
            <img
              src={proxyImage(post.productThumbnail)}
              alt={post.productName ?? "후기 상품 이미지"}
              className="h-full w-full object-contain p-1 transition-transform duration-300 group-hover/product:scale-105"
              loading="lazy"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">상품 보기</p>
            <span className="line-clamp-2 text-xs font-semibold leading-snug text-slate-700">{post.productName}</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary" />
        </Link>
      )}
      <div className="flex items-center justify-between gap-2 pt-3 mt-auto border-t border-slate-100">
        <span className="text-xs font-medium text-slate-500 truncate">{name}</span>
        <Link href={`/shop/itemuseview.php?is_id=${post.id}`} className="text-xs text-primary font-bold hover:underline">후기 보기 ↗</Link>
      </div>
    </article>
  );
}

const REVIEWS_PER_PAGE = 8;
const MAX_REVIEW_PAGES = 3;

function CustomerReviewSection() {
  const { data, isLoading } = trpc.community.recentBySlug.useQuery({ slug: "review", limit: REVIEWS_PER_PAGE * MAX_REVIEW_PAGES });
  const reviews = data ?? [];

  if (!isLoading && reviews.length === 0) return null;

  return (
    <section id="reviews" className="bg-white py-8 md:py-10">
      <div className="container">
        <div className="flex items-end justify-between mb-6">
          <div><p className="shop-eyebrow mb-3">LATEST REVIEWS</p><h2 className="shop-section-title">사용자들의 솔직한 이야기 <span className="text-primary">✦</span></h2><p className="text-sm text-slate-500 mt-3">고르고, 써보고, 남겨주신 이야기입니다.</p></div>
          <Link href="/shop/itemuselist.php" className="hidden sm:flex text-sm font-bold text-slate-700 hover:text-primary items-center gap-1 transition-colors">
            전체 후기 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="weshop-review-track scrollbar-hide" aria-label="후기 목록 불러오는 중">
            {Array.from({ length: REVIEWS_PER_PAGE }).map((_, i) => <div key={i} className="weshop-review-slide"><Skeleton className="h-44 w-full rounded-xl" /></div>)}
          </div>
        ) : (
          <div className="weshop-review-track scrollbar-hide" aria-label="후기 목록">
            {reviews.map((post: any) => <div key={post.id} className="weshop-review-slide"><ReviewCard post={post} /></div>)}
          </div>
        )}
      </div>
    </section>
  );
}

function InfoBanner() {
  return (
    <Link href="/bbs/board.php?bo_table=info" className="block py-4 hover:opacity-95 transition-opacity">
      <div className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-8 py-6 flex items-center justify-between shadow-md">
        <div className="text-white space-y-1">
          <p className="text-xs font-semibold tracking-widest opacity-80 uppercase">WESHOP 커뮤니티</p>
          <p className="text-lg font-bold leading-snug">탈모지식인 — 탈모정보 공유하고<br />현금포인트 적립하기</p>
          <p className="text-xs opacity-75 mt-1">정보를 나누면 포인트가 쌓입니다</p>
        </div>
        <div className="flex flex-col items-center gap-1 text-white opacity-90 shrink-0 ml-6">
          <span className="text-4xl">💚</span>
          <span className="text-xs font-bold bg-white/20 rounded-full px-3 py-0.5">지금 참여하기</span>
        </div>
      </div>
    </Link>
  );
}

function PromoCard() {
  return (
    <div className="min-w-0 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background border border-border rounded-xl p-5 gap-2 h-full">
      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold tracking-wide border border-blue-200 dark:border-blue-800 rounded-full px-3 py-0.5">
        정품보증 · 안심품질
      </span>
      <div className="flex items-center gap-1.5 mt-1">
        <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">최저가</span>
        <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">PLUS</span>
      </div>
      <p className="text-base font-bold tracking-widest text-foreground mt-1">세 일</p>
      <p className="text-3xl font-extrabold text-red-500 leading-none">10<span className="text-xl">%할인</span></p>
      <Link href="/products" className="mt-2 flex items-center gap-1 bg-amber-400 hover:bg-amber-500 transition-colors text-white text-xs font-bold px-5 py-2 rounded-full shadow">
        <Star className="w-3 h-3 fill-white" /> 전상품 대상 <Star className="w-3 h-3 fill-white" />
      </Link>
      <p className="text-[10px] text-muted-foreground mt-1 text-center leading-snug">
        지금 바로 고객 리뷰를 남겨주세요!
      </p>
    </div>
  );
}

function CommunitySectionMenu() {
  const items = [
    {
      icon: <Newspaper className="w-5 h-5 text-primary" />,
      title: "건강뉴스",
      desc: "카테고리별 국내외 건강 뉴스 및 연구 정보",
      href: "/news",
    },
    {
      icon: <BookOpen className="w-5 h-5 text-primary" />,
      title: "정보나눔",
      desc: "상품 관련 정보를 자유롭게 공유하는 게시판입니다.",
      href: "/info-board",
    },
    {
      icon: <Star className="w-5 h-5 text-primary" />,
      title: "고객리뷰",
      desc: "구매하신 상품의 후기를 남겨주세요.",
      href: "/community/review",
    },
    {
      icon: <FileText className="w-5 h-5 text-primary" />,
      title: "공지사항",
      desc: "쇼핑몰의 중요한 소식을 전해드립니다.",
      href: "/bbs/board.php?bo_table=notice",
    },
    {
      icon: <HelpCircle className="w-5 h-5 text-primary" />,
      title: "FAQ",
      desc: "자주 묻는 질문과 답변을 확인하세요.",
      href: "/customer-service/faq",
    },
    {
      icon: <ShoppingBag className="w-5 h-5 text-primary" />,
      title: "장바구니",
      desc: "담아두신 상품을 확인하고 구매하세요.",
      href: "/cart",
    },
    {
      icon: <Users className="w-5 h-5 text-primary" />,
      title: "마이페이지",
      desc: "주문 내역, 포인트, 나의 정보를 확인하세요.",
      href: "/mypage",
    },
  ];

  return (
    <section className="py-8 md:py-10 bg-secondary/20">
      <div className="container">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">커뮤니티</h2>
          <p className="text-sm text-muted-foreground mt-1">회원들과 자유롭게 소통하세요</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <Link key={item.title} href={item.href}>
              <div className="bg-card rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{item.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function BoardPreviewSection() {
  return (
    <section className="py-8 border-t border-border/60">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 items-start divide-y md:divide-y-0 md:divide-x divide-border/60">

          {/* 1. 공지사항 — col-span-5 */}
          <div className="md:col-span-5 py-6 md:py-2 md:pr-10">
            <BoardPreviewColumn slug="notice" title="공지사항" href="/bbs/board.php?bo_table=notice" limit={3} postLinkFn={(post) => `/bbs/board.php?bo_table=notice&wr_id=${post.id}`} />
          </div>

          {/* 2. 1:1 문의 — col-span-4 */}
          <div className="md:col-span-4 py-6 md:py-2 md:px-10 flex flex-col gap-3">
            <p className="text-xs text-muted-foreground font-medium">고객센터</p>
            <p className="text-base font-semibold leading-snug">궁금하신 점이 있으신가요?<br /><span className="text-primary">1:1 문의</span>로 빠르게 답변해드립니다.</p>
            <Link href="/customer-service/inquiry">
              <span className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer shadow-sm">
                1:1 문의하기
              </span>
            </Link>
          </div>

          {/* 3. 앱 다운로드 — col-span-3 */}
          <div className="md:col-span-3 py-6 md:py-2 md:pl-10 flex flex-col gap-3">
            <p className="text-xs text-muted-foreground font-medium">앱 다운로드</p>
            <div className="flex gap-3">
              <button
                onClick={() => toast.info("앱 서비스 준비 중입니다. 조금만 기다려 주세요! 😊")}
                className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border border-border hover:bg-accent transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
                  <path d="M3.18 1.05C2.76 1.29 2.5 1.73 2.5 2.26v19.48c0 .53.26.97.68 1.21l.1.06 10.91-10.91v-.26L3.28.99l-.1.06z" fill="#EA4335"/>
                  <path d="M17.47 15.43l-3.63-3.64v-.27l3.63-3.63.08.05 4.3 2.44c1.23.7 1.23 1.84 0 2.54l-4.3 2.44-.08.07z" fill="#FBBC04"/>
                  <path d="M17.55 15.36L13.88 11.7 3.18 22.4c.41.43 1.07.49 1.82.05l12.55-7.09" fill="#34A853"/>
                  <path d="M17.55 8.04L5 .95C4.25.51 3.59.57 3.18 1l10.7 10.71 3.67-3.67z" fill="#EA4335"/>
                </svg>
                <span className="text-xs text-muted-foreground">구글플레이</span>
              </button>
              <button
                onClick={() => toast.info("앱 서비스 준비 중입니다. 조금만 기다려 주세요! 😊")}
                className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border border-border hover:bg-accent transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span className="text-xs text-muted-foreground">앱스토어</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function PersonalizedSection() {
  const { isAuthenticated, user } = useAuth();
  const { data } = trpc.recommendation.personalized.useQuery(
    { limit: 24 },
    { enabled: isAuthenticated }
  );
  const [page, setPage] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ dragging: false, startX: 0, startPage: 0, moved: false });

  const products = data?.products ?? [];
  const perView = 6;
  const totalPages = Math.max(1, Math.ceil(products.length / perView));

  const goToPage = (p: number) => setPage(Math.max(0, Math.min(totalPages - 1, p)));

  const startAutoPlay = () => {
    if (products.length <= perView) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setPage(prev => (prev + 1) % totalPages);
    }, 2500);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  useEffect(() => {
    startAutoPlay();
    return stopAutoPlay;
  }, [products.length, totalPages]);

  // Mouse drag — snap to page on release
  const onMouseDown = (e: React.MouseEvent) => {
    stopAutoPlay();
    dragState.current = { dragging: true, startX: e.clientX, startPage: page, moved: false };
    e.preventDefault();
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragState.current.dragging || !trackRef.current) return;
    const dx = e.clientX - dragState.current.startX;
    if (Math.abs(dx) > 5) dragState.current.moved = true;
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!dragState.current.dragging || !trackRef.current) return;
    const dx = e.clientX - dragState.current.startX;
    const threshold = trackRef.current.offsetWidth * 0.2;
    if (dx < -threshold) goToPage(dragState.current.startPage + 1);
    else if (dx > threshold) goToPage(dragState.current.startPage - 1);
    dragState.current.dragging = false;
    startAutoPlay();
  };

  const onMouseLeave = () => {
    if (dragState.current.dragging) {
      dragState.current.dragging = false;
      startAutoPlay();
    }
  };

  // Touch — snap to page on release
  const onTouchStart = (e: React.TouchEvent) => {
    stopAutoPlay();
    dragState.current = { dragging: true, startX: e.touches[0].clientX, startPage: page, moved: false };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragState.current.dragging) return;
    const dx = e.touches[0].clientX - dragState.current.startX;
    if (Math.abs(dx) > 5) dragState.current.moved = true;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!dragState.current.dragging || !trackRef.current) return;
    const dx = e.changedTouches[0].clientX - dragState.current.startX;
    const threshold = trackRef.current.offsetWidth * 0.2;
    if (dx < -threshold) goToPage(dragState.current.startPage + 1);
    else if (dx > threshold) goToPage(dragState.current.startPage - 1);
    dragState.current.dragging = false;
    startAutoPlay();
  };

  if (!isAuthenticated || products.length === 0) return null;

  const userName = (user as any)?.name ?? "회원";

  return (
    <section className="py-10">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">
              <span className="text-primary">{userName}</span>님 전용 AI 추천
            </h2>
            <p className="text-sm text-muted-foreground mt-1">구매 이력 기반 맞춤 추천 상품입니다</p>
          </div>
        </div>
        <div
          ref={trackRef}
          className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {/* Pad products to full pages so last page shows 6 slots */}
            {Array.from({ length: totalPages * perView }).map((_, i) => {
              const p = products[i];
              return (
                <div key={i} className="flex-shrink-0 px-2" style={{ width: `${100 / perView}%` }}>
                  {p ? (
                    <ProductCard product={p} />
                  ) : (
                    <div className="aspect-[3/4]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center gap-1.5 mt-4">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => { goToPage(i); stopAutoPlay(); startAutoPlay(); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === page ? "w-6 bg-primary" : "w-1.5 bg-border"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function RenewalPopup() {
  const STORAGE_KEY = "renewal_popup_hidden_until";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hiddenUntil = localStorage.getItem(STORAGE_KEY);
    if (!hiddenUntil || Date.now() > Number(hiddenUntil)) {
      setVisible(true);
    }
  }, []);

  const closeToday = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now() + 24 * 60 * 60 * 1000));
    setVisible(false);
  };

  const close = () => setVisible(false);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border">
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary-foreground" />
            <span className="text-primary-foreground font-bold text-base">사이트 리뉴얼 안내</span>
          </div>
          <button onClick={close} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-sm text-foreground leading-relaxed">
            현재 <span className="font-semibold text-primary">사이트 리뉴얼 작업</span>이 진행 중입니다.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            이 과정에서 기존 로그인 정보 및 주문 내역이 일시적으로 일치하지 않을 수 있습니다.
            불편을 드려 죄송하며, 빠르게 안정화될 수 있도록 최선을 다하겠습니다.
          </p>
          <div className="bg-muted rounded-xl px-4 py-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">문의 및 불편사항 접수</p>
              <a href="mailto:hlschool.cs@gmail.com" className="text-sm font-semibold text-primary hover:underline">
                hlschool.cs@gmail.com
              </a>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="px-6 pb-5 flex gap-2">
          <button
            onClick={closeToday}
            className="flex-1 text-sm text-muted-foreground hover:text-foreground border rounded-lg py-2 transition-colors"
          >
            오늘 하루 보지 않기
          </button>
          <button
            onClick={close}
            className="flex-1 text-sm font-semibold bg-primary text-primary-foreground rounded-lg py-2 hover:bg-primary/90 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

function ShopHero() {
  const { data } = trpc.product.list.useQuery({ limit: 8, sort: "popular" });
  const main = data?.products?.[0];
  const side = data?.products?.[1] ?? main;
  const categories = [
    { label: "신상품", Icon: Sparkles, href: "/products?filter=new", color: "#2864e8" },
    { label: "베스트", Icon: Trophy, href: "/products?filter=best", color: "#d6a02e" },
    { label: "탈모헤어", Icon: Scissors, href: "/products?category=hair-loss", color: "#4e7fdb" },
    { label: "성기능", Icon: HeartPulse, href: "/products?category=sexual-health", color: "#df5685" },
    { label: "피부미용", Icon: Droplets, href: "/products?category=skin-beauty", color: "#6750bb" },
    { label: "다이어트", Icon: Scale, href: "/products?category=diet", color: "#3e9b68" },
    { label: "건강", Icon: Leaf, href: "/products?category=health", color: "#db7632" },
  ];

  return (
    <section className="bg-white pt-8 md:pt-12 pb-2">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-[1.85fr_0.7fr] gap-5 min-h-[330px] md:min-h-[390px]">
          <div className="relative overflow-hidden rounded-[1.5rem] bg-[#142544] text-white p-8 md:p-12 flex items-end shadow-[0_18px_45px_rgba(17,36,74,0.16)]">
            <div className="relative z-10 max-w-[48%] md:max-w-[44%]">
              <p className="text-xs tracking-[0.24em] font-bold text-blue-300 mb-4 uppercase">WESHOP CURATION</p>
              <h1 className="text-3xl md:text-5xl font-black leading-[1.12] tracking-[-0.06em] mb-5">당신의 일상에,<br />한 단계 더.</h1>
              <p className="text-sm md:text-base text-blue-100/75 leading-relaxed mb-7">탈모·피부·건강을 위한 해외직구부터<br />매일 필요한 생활 아이템까지.</p>
              <Link href="/products" className="shop-blue-button bg-[#2864e8]">나의 쇼핑 시작하기 <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </div>
            {main?.thumbnail ? (
              <img src={proxyImage(main.thumbnail)} alt="추천 상품" className="absolute inset-y-0 right-0 w-[62%] h-full object-cover opacity-90 [mask-image:linear-gradient(90deg,transparent_0%,black_22%)]" />
            ) : (
              <div className="absolute right-0 inset-y-0 w-[58%] bg-gradient-to-l from-blue-100/70 to-transparent" />
            )}
            <div className="absolute bottom-8 right-8 text-xs text-white/65 tracking-wide">01 / 01&nbsp;&nbsp; WESHOP SELECTION</div>
          </div>
          <div className="relative overflow-hidden rounded-[1.5rem] bg-[#eaf0fc] p-7 md:p-8 flex flex-col justify-between text-[#1b315d] min-h-[260px]">
            <div className="relative z-10 max-w-[72%]">
              <p className="text-xs tracking-[0.24em] font-bold text-slate-500 mb-4 uppercase">SMART CHOICE</p>
              <h2 className="text-2xl md:text-3xl font-black leading-tight tracking-[-0.05em]">가볍게 고르고,<br />꾸준히 챙기세요.</h2>
              <p className="text-sm text-slate-500 mt-4 leading-relaxed">오늘 필요한 건강 루틴,<br />나만의 컬렉션으로.</p>
              <Link href="/products" className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-primary">상품 둘러보기 <ArrowRight className="w-4 h-4" /></Link>
            </div>
            {side?.thumbnail && <img src={proxyImage(side.thumbnail)} alt="추천 건강 상품" className="absolute bottom-0 right-0 w-full h-[58%] object-cover object-center opacity-80 mix-blend-multiply" />}
          </div>
        </div>
        <div className="flex items-start justify-center gap-7 md:gap-14 py-3 md:py-4 overflow-x-auto scrollbar-hide">
          {categories.map(({ Icon, ...item }) => (
            <Link key={item.label} href={item.href} className="group flex shrink-0 flex-col items-center gap-2.5 text-slate-700 hover:text-primary">
              <span
                className="weshop-category-frame flex h-12 w-12 items-center justify-center rounded-[0.9rem] border-2 bg-white/80 md:h-14 md:w-14"
                style={{ borderColor: `${item.color}66` }}
              >
                <Icon
                  aria-hidden="true"
                  className="weshop-category-icon h-7 w-7 md:h-8 md:w-8"
                  style={{ color: item.color }}
                  strokeWidth={1.8}
                />
              </span>
              <span className="text-xs md:text-sm font-bold whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShopProductShowcase() {
  const { data, isLoading } = trpc.product.list.useQuery({ limit: 8, sort: "popular" });
  const products = data?.products ?? [];
  return (
    <section id="popular" className="bg-white pt-6 md:pt-8 pb-8 md:pb-10">
      <div className="container">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div className="min-w-0">
            <p className="shop-eyebrow mb-3">PICKS FOR YOU</p>
            <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
              <h2 className="shop-section-title">오늘의 추천 상품 <span className="text-primary">✦</span></h2>
              <p className="text-sm md:text-base text-slate-500 mb-1">지금 가장 많이 찾는 건강 루틴과 인기 아이템</p>
            </div>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-primary">전체 상품 보기 <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-5 mb-7">
          <span className="rounded-full bg-[#17213f] text-white px-5 py-2.5 text-sm font-bold">추천 상품</span>
          <Link href="/products?filter=best" className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-500 hover:border-primary hover:text-primary">베스트</Link>
          <Link href="/products?filter=sale" className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-500 hover:border-primary hover:text-primary">할인 상품</Link>
          <span className="ml-auto text-xs text-slate-400">전체 · {data?.total ?? 0}개의 상품</span>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[0.9] rounded-2xl" />)}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {products.slice(0, 8).map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function NewProductShowcase() {
  const { data, isLoading } = trpc.product.list.useQuery({ limit: 4, sort: "newest" });
  const products = data?.products ?? [];
  return (
    <section className="bg-[#fbfcff] py-8 md:py-10">
      <div className="container">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div className="min-w-0">
            <p className="shop-eyebrow mb-3">NEW ARRIVALS</p>
            <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
              <h2 className="shop-section-title">신상품 <span className="text-primary">✦</span></h2>
              <p className="text-sm md:text-base text-slate-500 mb-1">새롭게 등록된 상품을 가장 먼저 만나보세요</p>
            </div>
          </div>
          <Link href="/products?filter=new" className="hidden sm:flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-primary">신상품 전체 보기 <ArrowRight className="w-4 h-4" /></Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[0.9] rounded-2xl" />)}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {products.slice(0, 4).map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function CuratedMoments() {
  const { data } = trpc.product.list.useQuery({ limit: 8, sort: "newest" });
  const first = data?.products?.[2] ?? data?.products?.[0];
  const second = data?.products?.[3] ?? data?.products?.[1];
  const cards = [
    { eyebrow: "HAIR & WELLNESS", title: "매일의 루틴을 가볍게", body: "나에게 맞는 건강 아이템 둘러보기", image: first?.thumbnail, href: "/products?category=hair-loss" },
    { eyebrow: "SKIN & DAILY CARE", title: "더 나은 나를 위한 선택", body: "피부와 생활을 위한 큐레이션", image: second?.thumbnail, href: "/products?category=skin-beauty" },
  ];
  return (
    <section className="bg-[#fbfcff] py-8 md:py-10">
      <div className="container">
        <div className="flex items-end justify-between mb-6"><div><p className="shop-eyebrow mb-3">CURATED MOMENTS</p><h2 className="shop-section-title">더 나은 건강 라이프</h2></div><span className="hidden md:block text-sm text-slate-400">당신의 일상을 위한 작은 영감</span></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map(card => <Link key={card.title} href={card.href} className="group relative overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white min-h-[220px] flex items-stretch"><div className="w-[45%] overflow-hidden bg-slate-100">{card.image && <img src={proxyImage(card.image)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}</div><div className="flex-1 p-7 md:p-9 flex flex-col justify-center"><p className="shop-eyebrow text-[10px] mb-3">{card.eyebrow}</p><h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-950">{card.title}</h3><p className="mt-3 text-sm text-slate-500">{card.body} <ArrowRight className="inline w-4 h-4 ml-1" /></p></div></Link>)}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  useSEO({
    title: undefined,
    description: "커뮤니티와 쇼핑이 하나로 연결된 새로운 쇼핑 경험을 만나보세요.",
    keywords: "쇼핑몰, 커뮤니티, 이커머스, 상품리뷰, 온라인쇼핑",
  });
  return (
    <Layout>
      <div className="bg-white">
        <ShopHero />
        <ShopProductShowcase />
        <CuratedMoments />
        <NewProductShowcase />
        <CustomerReviewSection />
        <CommunitySectionMenu />
        <NewsPreviewSection />
      </div>
    </Layout>
  );
}
