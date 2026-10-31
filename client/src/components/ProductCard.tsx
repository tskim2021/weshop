import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, GitCompare } from "lucide-react";
import { formatPrice, getDiscountPercent, proxyImage, productHref } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useCompareStore } from "@/stores/compareStore";

type ProductCardProps = {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    thumbnail: string | null;
    isFeatured: number;
    isNew: number;
    isBest: number;
    status: string;
    avgRating: string | null;
    reviewCount: number;
    description?: string | null;
    hashtags?: string[] | null;
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => { toast.success("장바구니에 추가되었습니다"); utils.cart.list.invalidate(); },
    onError: () => toast.error("로그인이 필요합니다"),
  });
  const { data: wishlistItems } = trpc.wishlist.list.useQuery(undefined, { enabled: isAuthenticated });
  const isWishlisted = wishlistItems?.some(item => item.productId === product.id) ?? false;
  const toggleWishlist = trpc.wishlist.toggle.useMutation({
    onSuccess: (data) => { toast.success(data.isAdded ? "위시리스트에 추가" : "위시리스트에서 제거"); utils.wishlist.list.invalidate(); },
  });

  const discount = getDiscountPercent(product.price, product.salePrice);
  const displayPrice = product.salePrice ?? product.price;
  const rating = product.avgRating ? parseFloat(product.avgRating) : 0;

  return (
    <div className="group relative min-w-0">
      {/* Image */}
      <Link href={productHref(product.slug, product.itId)}>
        <div className="relative aspect-square bg-[#eef1f6] overflow-hidden rounded-[1.15rem] border border-slate-200/70">
          {product.thumbnail ? (
            <>
              <img src={proxyImage(product.thumbnail)} alt={product.name} referrerPolicy="no-referrer" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.style.display = "none"; const ph = e.currentTarget.nextElementSibling as HTMLElement; if (ph) ph.style.display = "flex"; }} />
              <div className="w-full h-full items-center justify-center text-muted-foreground absolute inset-0 bg-secondary/30" style={{ display: "none" }}>
                <ShoppingCart className="w-12 h-12 opacity-20" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ShoppingCart className="w-12 h-12 opacity-20" />
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {(discount || product.isNew === 1 || product.isBest === 1) && <Badge className="bg-white text-[#2864e8] shadow-sm text-[10px] px-2.5 py-1 font-black">{discount ? "SALE PICK" : product.isNew === 1 ? "NEW PICK" : "BEST PICK"}</Badge>}
            {product.status === "soldout" && <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">품절</Badge>}
          </div>
          {/* Quick actions */}
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); useCompareStore.getState().addProduct(product.id); toast.success("비교함에 추가되었습니다"); }}
              className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-md transition-colors"
            >
              <GitCompare className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!isAuthenticated) { toast.error("로그인이 필요합니다"); return; } toggleWishlist.mutate({ productId: product.id }); }}
              className={`w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-md transition-colors ${isWishlisted ? "text-rose-500" : ""}`}
            >
              <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>

          </div>
        </div>
      </Link>
      {/* Info */}
      <div className="pt-4 px-0.5">
        <Link href={productHref(product.slug, product.itId)}>
          <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-slate-400 mb-2">WESHOP PICK</p>
          <h3 className="text-[15px] font-bold line-clamp-2 mb-3 hover:text-primary transition-colors leading-snug text-slate-900">{product.name}</h3>
        </Link>
        <div className="flex items-end gap-2 mb-2">
          {discount && <span className="text-lg font-black text-[#2864e8] price-text">{discount}%</span>}
          <span className="text-xl font-black price-text text-slate-950">{formatPrice(displayPrice)}</span>
          {product.salePrice && (
            <span className="text-xs text-slate-400 line-through price-text">{formatPrice(product.price)}</span>
          )}
        </div>
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            {rating > 0 && (
              <>
                <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                <span>{rating.toFixed(1)}</span>
              </>
            )}
            <span>리뷰 {product.reviewCount}개</span>
          </div>
        )}
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">{product.description}</p>
        )}
        {product.hashtags && product.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.hashtags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0.5">#{tag}</Badge>
            ))}
            {product.hashtags.length > 3 && <span className="text-[10px] text-muted-foreground">+{product.hashtags.length - 3}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
