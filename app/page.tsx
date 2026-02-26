// Next.js components and helpers
import Image from "next/image";
import { revalidatePath } from "next/cache";
// Supabase client for database access
import { supabase } from "@/lib/supabaseClient";

type Review = {
  id: number;
  name: string;
  stars: number;
  text: string;
  created_at: string;
};

function pickRandomReviews(reviews: Review[], count: number): Review[] {
  const shuffled = [...reviews];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

// Server action that handles review form submissions
async function createReview(formData: FormData) {
  "use server"; // directive indicating this function runs on the server
// NEW COMMIT
  // extract and sanitize input values
  const name = (formData.get("name") as string | null)?.trim();
  const starsValue = formData.get("stars") as string | null;
  const text = (formData.get("text") as string | null)?.trim();
  const stars = starsValue ? Number(starsValue) : NaN;

  // basic validation: all fields required and stars between 1–5
  if (!name || !text || !stars || Number.isNaN(stars) || stars < 1 || stars > 5) return;

  // insert into the reviews table and trigger revalidation of the home page
  const { error } = await supabase.from("reviews").insert({ name, stars, text });
  if (error) {
    console.error("Failed to create review:", error.message);
    return;
  }
  revalidatePath("/");
}

export default async function Home() {
  // get public URL for hero image from storage
  const heroImageUrl = supabase.storage.from("eblen-site-assets").getPublicUrl("utp-photo.png").data.publicUrl;

  // fetch products and reviews in parallel
  const [{ data: products }, { data: reviews }] = await Promise.all([
    supabase.from("products").select("id, image_url, name, weight_grams, composition, price_rub").order("id", { ascending: true }),
    supabase.from("reviews").select("id, name, stars, text, created_at").order("created_at", { ascending: false }),
  ]);
  const randomReviews = pickRandomReviews((reviews ?? []) as Review[], 4);

  return (
    <div className="min-h-screen">
      <main className="mx-auto w-full max-w-5xl px-4 pb-14 pt-8 sm:px-6">
        {/* site header with logo and contact link */}
        <header className="reveal mb-14 flex items-center justify-between border-b border-[var(--border-soft)] pb-4">
          <span className="text-sm tracking-[0.14em] text-[var(--accent)]">EBLEN SUSHI</span>
          <a href="#contacts" className="btn-secondary px-3 py-1.5 text-xs">
            Контакты
          </a>
        </header>

        {/* hero section with tagline and image */}
        <section id="hero" className="reveal mb-16 grid items-center gap-8 md:grid-cols-2">
          <div className="space-y-5">
            <h1 className="text-4xl leading-tight sm:text-5xl">Привет Самирка это я Буба я тебя люблю ❤️</h1>
            <p className="max-w-xl text-sm text-[var(--text-soft)] sm:text-base">Простое меню, прозрачные цены, аккуратная подача.</p>
            <div className="flex flex-wrap gap-3">
              <a href="#catalog" className="btn-primary px-5 py-2 text-sm">
                Каталог
              </a>
              <a href="#reviews" className="btn-secondary px-5 py-2 text-sm">
                Отзывы
              </a>
            </div>
          </div>
          <div className="panel relative hidden aspect-[4/3] overflow-hidden rounded-xl md:block">
            {heroImageUrl ? (
              <Image src={heroImageUrl} alt="Свежие суши" fill sizes="(min-width: 768px) 500px, 100vw" className="object-cover" />
            ) : (
              <div className="h-full w-full bg-[#fff4e8]" />
            )}
          </div>
        </section>

        {/* product catalog listing */}
        <section id="catalog" className="reveal mb-16 space-y-4">
          <h2 className="text-2xl">Каталог</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(products ?? []).map((item) => (
              <article key={item.id} className="panel rounded-xl p-3.5">
                {item.image_url && (
                  <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg">
                    <Image src={item.image_url} alt={item.name} fill sizes="(min-width: 1024px) 300px, 100vw" className="object-cover" />
                  </div>
                )}
                <h3 className="text-lg">{item.name}</h3>
                <p className="mt-1 text-xs text-[var(--text-soft)]">{item.weight_grams} г</p>
                <p className="mt-2 text-xs text-[var(--text-soft)]">{item.composition}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg text-[var(--accent)]">{item.price_rub.toLocaleString("ru-RU")} ₽</span>
                  <button type="button" className="btn-secondary px-3 py-1.5 text-xs">
                    Заказать
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* reviews display and submission form */}
        <section id="reviews" className="reveal mb-16 space-y-4">
          <h2 className="text-2xl">Отзывы</h2>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="grid gap-4 sm:grid-cols-2">
              {randomReviews.map((review) => (
                <article key={review.id} className="panel rounded-xl p-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>{review.name}</span>
                    <span className="text-xs text-[var(--accent)]">
                      {"★".repeat(review.stars)}
                      {"☆".repeat(5 - review.stars)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-soft)]">{review.text}</p>
                </article>
              ))}
            </div>

            <form action={createReview} className="panel space-y-3 rounded-xl p-4">
              <h3 className="text-lg">Оставить отзыв</h3>
              <input name="name" type="text" required placeholder="Имя" className="field w-full rounded-lg px-3 py-2 text-xs" />
              <select name="stars" required defaultValue="5" className="field w-full rounded-lg px-3 py-2 text-xs">
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} из 5
                  </option>
                ))}
              </select>
              <textarea name="text" required rows={4} placeholder="Ваш отзыв" className="field w-full resize-none rounded-lg px-3 py-2 text-xs" />
              <button type="submit" className="btn-primary px-4 py-2 text-xs">
                Отправить
              </button>
            </form>
          </div>
        </section>

        {/* contact information footer section */}
        <section id="contacts" className="reveal border-t border-[var(--border-soft)] pt-6 text-sm text-[var(--text-soft)]">
          <p>Instagram: @your_sushi_shop</p>
          <p>Телефон: +7 (999) 123-45-67</p>
          <p className="text-green-600">Адрес: ул. Примерная, 10</p>
          <p>Ежедневно: 11:00-23:00</p>
          <footer className="mt-4 text-[11px]">© {new Date().getFullYear()} Eblen Sushi</footer>
        </section>
      </main>
    </div>
  );
}
