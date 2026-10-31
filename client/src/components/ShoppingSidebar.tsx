import { trpc } from "@/lib/trpc";
import { useRecentProducts } from "@/hooks/useRecentProducts";
import { formatPrice, getDiscountPercent, proxyImage, productHref } from "@/lib/utils";
import { TrendingUp, Clock, Search, ShoppingCart, X, Flame, Gift } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

function EventBanner() {
  const { data: banners } = trpc.product.publicBanners.useQuery();
  const banner = banners?.[0];

  if (!banner?.imageUrl) {
    return (
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 rounded-xl border p-5 elegant-shadow text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Gift className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">진행 중인 이벤트가 없습니다</p>
        <p className="text-xs text-muted-foreground">신규 이벤트 오픈 예정</p>
      </div>
    );
  }

  return (
    <Link href={banner.linkUrl || "/products"}>
      <div className="rounded-xl overflow-hidden border elegant-shadow hover:opacity-90 transition-opacity cursor-pointer">
        <img src={banner.imageUrl} alt="이벤트 배너" className="w-full h-auto object-cover" />
      </div>
    </Link>
  );
}

function RecentProducts() {
  const { recentProducts, clearAll } = useRecentProducts();

  if (recentProducts.length === 0) {
    return (
      <div className="text-center py-4">
        <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
        <p className="text-xs text-muted-foreground">최근 본 상품이 없습니다</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {recentProducts.slice(0, 6).map(product => {
          const discount = getDiscountPercent(product.price, product.salePrice);
          const displayPrice = product.salePrice ?? product.price;
          return (
            <Link key={product.id} href={productHref(product.slug, product.itId)}>
              <div className="flex gap-2.5 p-2 rounded-lg hover:bg-accent/60 transition-colors group">
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-lg bg-secondary/50 overflow-hidden shrink-0">
                  {product.thumbnail ? (
                    <img
                      src={proxyImage(product.thumbnail)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={e => {
                        const el = e.currentTarget;
                        el.style.display = "none";
                        const parent = el.parentElement;
                        if (parent && !parent.querySelector(".img-fallback")) {
                          const fb = document.createElement("div");
                          fb.className = "img-fallback w-full h-full flex items-center justify-center";
                          fb.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-muted-foreground opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';
                          parent.appendChild(fb);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {discount && (
                      <span className="text-[10px] font-bold text-destructive">-{discount}%</span>
                    )}
                    <span className="text-xs font-bold price-text">{formatPrice(displayPrice)}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {recentProducts.length > 0 && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors mt-2 mx-auto"
        >
          <X className="w-3 h-3" />
          전체 삭제
        </button>
      )}
    </div>
  );
}

/** Sidebar content without wrapper - for embedding in existing aside */
export function ShoppingSidebarContent() {
  return (
    <>
      {/* 이벤트 배너 */}
      <EventBanner />

      {/* 최근 본 상품 */}
      <div className="bg-card rounded-xl border p-4 elegant-shadow">
        <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-border/60">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">최근 본 상품</h3>
        </div>
        <RecentProducts />
      </div>
    </>
  );
}

export default function ShoppingSidebar() {
  return (
    <aside className="w-60 shrink-0 space-y-6">
      <ShoppingSidebarContent />
    </aside>
  );
}
