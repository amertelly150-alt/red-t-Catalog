import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpLeft, Instagram, Menu, MessageCircle, X } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Admin from '@/pages/admin';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { content as defaultContent, WHATSAPP_NUMBER } from '@/data/content';
import { ALL_CATEGORY, ALL_SUBCATEGORY, categories, categoryNames, products, type Product } from '@/data/products';
import { useGetCatalog } from '@workspace/api-client-react';

const queryClient = new QueryClient();

function whatsappHref(product?: Product, whatsappNumber = WHATSAPP_NUMBER) {
  const message = product
    ? `${defaultContent.whatsapp.productMessagePrefix} ${product.name}`
    : defaultContent.whatsapp.genericMessage;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function WhatsAppButton({ product, dark = false, whatsappNumber = WHATSAPP_NUMBER }: { product?: Product; dark?: boolean; whatsappNumber?: string }) {
  return (
    <a
      href={whatsappHref(product, whatsappNumber)}
      target="_blank"
      rel="noreferrer"
      data-testid={product ? `link-order-${product.id}` : 'link-whatsapp-contact'}
      className={`inline-flex items-center justify-center gap-3 rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${dark ? 'bg-[#f2efe8] text-[#171516] hover:bg-[#d20b18] hover:text-[#f2efe8]' : 'bg-[#d20b18] text-[#f2efe8] hover:bg-[#171516]'}`}
    >
      <MessageCircle size={17} strokeWidth={1.8} />
      <span>{product ? defaultContent.whatsapp.productButton : defaultContent.whatsapp.genericButton}</span>
    </a>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#top" className={`flex items-center gap-2 ${compact ? 'scale-90 origin-right' : ''}`} data-testid="link-brand-home">
      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[3px] bg-[#f7f6f3]">
      <img src={defaultContent.logoPath} alt="red-t الشعار" className="h-full w-full object-contain" />
      </span>
    </a>
  );
}

function Nav({ whatsappNumber = WHATSAPP_NUMBER }: { whatsappNumber?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-[74px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-12" dir="rtl">
        <BrandMark />
        <nav className="hidden items-center gap-9 md:flex">
          {defaultContent.navigation.map(({ label, href }) => (
            <a key={href} href={href} className="nav-link text-[13px] font-medium text-[#f2efe8]/75 hover:text-[#f2efe8]" data-testid={`link-nav-${label}`}>{label}</a>
          ))}
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-[#f2efe8]/70 transition hover:text-[#f2efe8]" data-testid="link-instagram"><Instagram size={18} /></a>
           <a href="#products" className="rounded-full border border-[#f2efe8]/30 px-5 py-2.5 text-[12px] font-semibold text-[#f2efe8] transition hover:border-[#d20b18] hover:bg-[#d20b18]" data-testid="link-browse-products">{defaultContent.hero.ctaText}</a>
        </div>
        <button onClick={() => setOpen(!open)} className="text-[#f2efe8] md:hidden" aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'} data-testid="button-mobile-menu">
          {open ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>
      {open && (
        <div className="mx-4 border-t border-[#f2efe8]/15 bg-[#171516] px-5 py-5 md:hidden" dir="rtl">
          <div className="flex flex-col gap-5">
            {defaultContent.navigation.map(({ label, href }) => <a key={href} href={href} onClick={() => setOpen(false)} className="text-sm text-[#f2efe8]/80" data-testid={`link-mobile-${label}`}>{label}</a>)}
            <WhatsAppButton whatsappNumber={whatsappNumber} />
          </div>
        </div>
      )}
    </header>
  );
}

function ProductCard({ product, index, whatsappNumber = WHATSAPP_NUMBER }: { product: Product; index: number; whatsappNumber?: string }) {
  return (
    <article className={`product-card group ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`} data-testid={`card-product-${product.id}`} dir="rtl">
      <div className={`relative overflow-hidden bg-[#dedbd3] ${index === 0 ? 'aspect-[1/1.08] md:aspect-auto md:h-full' : 'aspect-[1/1.06]'}`}>
          <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover mix-blend-multiply" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span className="font-mono text-[10px] uppercase tracking-[.14em] text-[#171516]/60">red-t / {String(index + 1).padStart(2, '0')}</span>
          {product.badge && <span className="rounded-full bg-[#d20b18] px-3 py-1 text-[10px] font-medium text-[#f2efe8]">{product.badge}</span>}
        </div>
        <div className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#f2efe8] text-[#171516] card-arrow">
          <ArrowUpLeft size={18} strokeWidth={1.6} />
        </div>
      </div>
      <div className="flex items-start justify-between gap-3 py-4">
        <div>
          <h3 className="text-[17px] font-semibold tracking-[-.02em] text-[#171516]">{product.name}</h3>
          <p className="mt-1 font-mono text-[9px] tracking-[.08em] text-[#6e6961]">{product.nameEn} · {product.tone}</p>
          <p className="mt-3 max-w-[220px] text-[12px] leading-6 text-[#6e6961]">{product.description}</p>
        </div>
        <div className="text-left">
          <span className="whitespace-nowrap font-mono text-[12px] font-medium text-[#171516]">{product.price}</span>
           <a href={whatsappHref(product, whatsappNumber)} target="_blank" rel="noreferrer" className="mt-3 inline-flex whitespace-nowrap rounded-full bg-[#d20b18] px-3 py-2 text-[10px] font-semibold text-[#f2efe8] transition hover:bg-[#171516]" data-testid={`link-card-order-${product.id}`}>اطلب عبر واتساب</a>
        </div>
      </div>
    </article>
  );
}

function Home() {
  const catalogQuery = useGetCatalog();
  const apiCatalog = catalogQuery.data;
  const liveProducts = apiCatalog?.products ?? products;
  const liveCategories = apiCatalog?.categories ?? categories;
  const liveCategoryNames = [ALL_CATEGORY, ...liveCategories.map((category) => category.name)];
  const liveWhatsappNumber = apiCatalog?.site.whatsappNumber ?? WHATSAPP_NUMBER;
  const content = apiCatalog?.site
    ? { ...defaultContent, hero: { ...defaultContent.hero, image: apiCatalog.site.heroImage, headline: apiCatalog.site.heroHeadline, description: apiCatalog.site.heroDescription } }
    : defaultContent;
  const trendingProducts = liveProducts.filter((product) => product.trending);
  const bestSellerProducts = liveProducts.filter((product) => product.bestSeller);
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [activeSubcategory, setActiveSubcategory] = useState(ALL_SUBCATEGORY);
  const selectedCategory = useMemo(() => liveCategories.find((category) => category.name === activeCategory), [activeCategory, liveCategories]);
  const availableSubcategories = selectedCategory ? [ALL_SUBCATEGORY, ...selectedCategory.subcategories] : [];
  const filteredProducts = useMemo(() => {
    if (activeCategory === ALL_CATEGORY) return liveProducts;
    return liveProducts.filter((product) => (
      product.category === activeCategory
      && (activeSubcategory === ALL_SUBCATEGORY || product.subcategory === activeSubcategory)
    ));
  }, [activeCategory, activeSubcategory, liveProducts]);

  const selectCategory = (category: string) => {
    setActiveCategory(category);
    setActiveSubcategory(ALL_SUBCATEGORY);
  };

  const selectCategoryAndScroll = (category: string) => {
    selectCategory(category);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main id="top" className="grain min-h-[100dvh] bg-[#f2efe8] text-[#171516]" dir="rtl">
      <section className="relative min-h-[700px] overflow-hidden bg-[#171516] text-[#f2efe8] lg:min-h-[790px]">
        <Nav whatsappNumber={liveWhatsappNumber} />
        <div className="hero-grid absolute inset-0 opacity-50" />
        <div className="absolute -left-16 top-24 h-[420px] w-[420px] rounded-full bg-[#d20b18]/20 blur-[100px]" />
        <div className="absolute inset-0 opacity-50 lg:right-[47%]">
            <img src={content.hero.image} alt="سيارة في مشهد حضري ليلي" fetchPriority="high" className="h-full w-full object-cover object-center mix-blend-screen opacity-60" />
        </div>
        <div className="relative mx-auto flex min-h-[700px] max-w-[1320px] items-end px-5 pb-14 pt-28 sm:px-8 lg:min-h-[790px] lg:px-12 lg:pb-20">
          <div className="relative z-10 max-w-[740px]">
            <div className="reveal mb-8 flex h-14 w-14 items-center justify-center overflow-hidden rounded-[3px] bg-[#f7f6f3]">
              <img src={content.logoPath} alt="red-t الشعار" className="h-full w-full object-contain" data-testid="img-hero-logo" />
            </div>
            <div className="reveal mb-7 flex items-center gap-3">
              <span className="h-[1px] w-12 bg-[#d20b18]" />
              <span className="font-mono text-[10px] tracking-[.16em] text-[#f2efe8]/65">{content.hero.eyebrow}</span>
            </div>
            <h1 className="reveal reveal-delay-1 display-tight font-display text-[70px] font-bold sm:text-[110px] lg:text-[155px]">
              <span className="block">{content.hero.headline[0]}</span>
              <span className="block text-[#d20b18]">{content.hero.headline[1]}</span>
            </h1>
            <div className="reveal reveal-delay-2 mt-9 flex max-w-[500px] flex-col items-start gap-7 sm:flex-row sm:items-end">
              <p className="max-w-[300px] text-[15px] leading-8 text-[#f2efe8]/70">{content.hero.description}</p>
              <a href="#products" className="group flex shrink-0 items-center gap-3 text-[13px] font-semibold text-[#f2efe8]" data-testid="link-hero-catalog">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f2efe8]/35 transition group-hover:border-[#d20b18] group-hover:bg-[#d20b18]"><ArrowLeft size={17} /></span>
                {content.hero.ctaText}
              </a>
            </div>
          </div>
          <div className="absolute bottom-12 left-5 hidden items-center gap-3 lg:flex">
            <span className="font-mono text-[10px] tracking-widest text-[#f2efe8]/50">{content.hero.scrollLabel}</span>
            <span className="h-12 w-px bg-[#f2efe8]/30" />
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-b border-[#c9c4b9] bg-[#d20b18] py-3 text-[#f2efe8]">
        <div className="marquee-track flex items-center gap-8 whitespace-nowrap font-mono text-[10px] tracking-[.18em]" dir="ltr">
          {Array.from({ length: 8 }).map((_, i) => <span key={i} className="flex items-center gap-8"><span>{content.tickerText}</span><span className="inline-block h-1.5 w-1.5 rounded-full bg-[#171516]" aria-hidden="true" /></span>)}
        </div>
      </div>

      <section id="story" className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
        <div className="grid gap-14 lg:grid-cols-[.85fr_1.15fr] lg:items-end" dir="rtl">
          <div>
            <span className="font-mono text-[10px] tracking-[.18em] text-[#d20b18]">{content.story.eyebrow}</span>
            <h2 className="mt-6 max-w-[570px] text-[40px] font-semibold leading-[1.18] tracking-[-.05em] sm:text-[58px]">{content.story.title}</h2>
          </div>
          <div className="flex max-w-[470px] flex-col gap-8 lg:pb-2">
            <p className="text-[17px] leading-9 text-[#514d47]">{content.story.description}</p>
            <a href="#products" className="flex w-fit items-center gap-3 border-b border-[#171516] pb-2 text-[13px] font-semibold" data-testid="link-story-catalog">{content.story.linkText} <ArrowLeft size={16} /></a>
          </div>
        </div>
      </section>

      <section id="trending" className="bg-[#e3dfd6] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1320px]" dir="rtl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <span className="font-mono text-[10px] tracking-[.18em] text-[#d20b18]">{content.trending.eyebrow}</span>
              <h2 className="mt-4 text-[38px] font-semibold tracking-[-.05em] sm:text-[54px]">{content.trending.title}</h2>
              <p className="mt-3 max-w-[420px] text-sm leading-7 text-[#6e6961]">{content.trending.description}</p>
            </div>
            <span className="hidden font-mono text-[10px] text-[#6e6961] sm:block">{content.trending.sideLabel}</span>
          </div>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
            {trendingProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index + 1} whatsappNumber={liveWhatsappNumber} />)}
          </div>
        </div>
      </section>

      <section id="bestsellers" className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div dir="rtl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <span className="font-mono text-[10px] tracking-[.18em] text-[#d20b18]">{content.bestSellers.eyebrow}</span>
              <h2 className="mt-4 text-[42px] font-semibold tracking-[-.06em] sm:text-[62px]">{content.bestSellers.title}</h2>
              <p className="mt-3 text-sm text-[#6e6961]">{content.bestSellers.description}</p>
            </div>
          </div>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
            {bestSellerProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index + 1} whatsappNumber={liveWhatsappNumber} />)}
          </div>
        </div>
      </section>

      <section id="categories" className="bg-[#171516] px-5 py-20 text-[#f2efe8] sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1320px]" dir="rtl">
          <span className="font-mono text-[10px] tracking-[.18em] text-[#d20b18]">{content.categories.eyebrow}</span>
          <div className="mt-5 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <h2 className="max-w-[540px] text-[42px] font-semibold leading-[1.05] tracking-[-.06em] sm:text-[62px]">{content.categories.title[0]}<br /><span className="text-[#d20b18]">{content.categories.title[1]}</span></h2>
            <p className="max-w-[340px] text-sm leading-7 text-[#f2efe8]/55">{content.categories.description}</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {liveCategories.map((category, index) => (
              <button key={category.name} onClick={() => selectCategoryAndScroll(category.name)} className="category-card flex min-h-[118px] flex-col justify-between rounded-[3px] border border-[#f2efe8]/15 bg-[#222021] p-4 text-right transition hover:-translate-y-1 hover:border-[#d20b18] hover:bg-[#d20b18]" data-testid={`button-category-${index}`}>
                <span className="text-xl">{category.name.split(' ')[0]}</span>
                <span className="text-[12px] font-semibold leading-5">{category.name.substring(category.name.indexOf(' ') + 1)}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div dir="rtl">
          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <span className="font-mono text-[10px] tracking-[.18em] text-[#d20b18]">{content.products.eyebrow}</span>
              <h2 className="mt-4 text-[42px] font-semibold tracking-[-.06em] sm:text-[62px]">{content.products.title}</h2>
              <p className="mt-3 text-sm text-[#6e6961]">{content.products.description}</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={content.products.filterLabel}>
              {liveCategoryNames.map((category, index) => <button key={category} onClick={() => selectCategory(category)} className={`category-pill whitespace-nowrap rounded-full border border-[#c9c4b9] px-4 py-2 text-[12px] ${activeCategory === category ? 'active' : 'hover:border-[#171516]'}`} role="tab" aria-selected={activeCategory === category} data-testid={`button-filter-${index}`}>{category}</button>)}
            </div>
          </div>
          {activeCategory !== ALL_CATEGORY && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={`التصنيفات الفرعية لـ ${activeCategory}`}>
              {availableSubcategories.map((subcategory, index) => (
                <button
                  key={subcategory}
                  onClick={() => setActiveSubcategory(subcategory)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-[12px] transition-colors ${activeSubcategory === subcategory ? 'border-[#DF2531] bg-[#DF2531] text-[#f2efe8]' : 'border-[#171516] bg-[#171516] text-[#f2efe8]/75 hover:border-[#DF2531] hover:text-[#f2efe8]'}`}
                  role="tab"
                  aria-selected={activeSubcategory === subcategory}
                  data-testid={`button-subcategory-${index}`}
                >
                  {subcategory}
                </button>
              ))}
            </div>
          )}
          <div className="mt-12 grid auto-rows-fr gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
            {filteredProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index} whatsappNumber={liveWhatsappNumber} />)}
          </div>
          {filteredProducts.length === 0 && <div className="py-24 text-center text-[#6e6961]">{content.products.emptyState}</div>}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#d20b18] px-5 py-24 text-[#f2efe8] sm:px-8 lg:px-12 lg:py-32" id="contact">
        <div className="absolute -left-10 -top-24 font-display text-[310px] font-bold leading-none text-[#171516]/10">t</div>
        <div className="relative mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[1fr_auto] lg:items-end" dir="rtl">
          <div>
            <span className="font-mono text-[10px] tracking-[.18em] text-[#171516]/65">{content.contact.eyebrow}</span>
            <h2 className="mt-6 max-w-[750px] text-[48px] font-semibold leading-[1.05] tracking-[-.06em] sm:text-[76px]">{content.contact.title[0]}<br /><span className="text-[#171516]">{content.contact.title[1]}</span></h2>
            <p className="mt-8 max-w-[390px] text-[15px] leading-8 text-[#f2efe8]/75">{content.contact.description}</p>
          </div>
          <div className="flex flex-col items-start gap-4">
             <WhatsAppButton dark whatsappNumber={liveWhatsappNumber} />
            <span className="font-mono text-[9px] tracking-wide text-[#171516]/60">{content.contact.note}</span>
          </div>
        </div>
      </section>

      <footer className="bg-[#171516] px-5 py-12 text-[#f2efe8] sm:px-8 lg:px-12" dir="rtl">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col justify-between gap-10 border-b border-[#f2efe8]/15 pb-12 md:flex-row md:items-end">
            <div><BrandMark compact /><p className="mt-6 max-w-[250px] text-sm leading-7 text-[#f2efe8]/50">{content.footer.statement}</p></div>
            <div className="grid grid-cols-2 gap-x-14 gap-y-4 text-[13px] text-[#f2efe8]/60">
              <a href="#products" className="hover:text-[#d20b18]" data-testid="link-footer-products">المنتجات</a>
              <a href="#story" className="hover:text-[#d20b18]" data-testid="link-footer-about">عن red-t</a>
              <a href="#contact" className="hover:text-[#d20b18]" data-testid="link-footer-contact">تواصل معنا</a>
              <a href={whatsappHref()} target="_blank" rel="noreferrer" className="hover:text-[#d20b18]" data-testid="link-footer-whatsapp">واتساب</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#d20b18]" data-testid="link-footer-instagram">إنستغرام</a>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 pt-6 font-mono text-[9px] tracking-[.1em] text-[#f2efe8]/35 sm:flex-row"><span dir="ltr">{content.footer.copyright}</span><span>{content.footer.closing}</span></div>
        </div>
      </footer>
    </main>
  );
}

function Router() {
  return (
    <ErrorBoundary resetKey={useLocation()[0]}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;