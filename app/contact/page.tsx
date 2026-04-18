import Image from "next/image";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/18SZVUozna/",
    icon: "/facebook.png",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/memz.m55?igsh=NjRsOG8wMnZpbDV4",
    icon: "/instagram.png",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@memz.m55?_r=1&_t=ZS-947iDiGFw3g",
    icon: "/tiktok.png",
  },
  {
    name: "X",
    href: "https://x.com/Memzm55",
    icon: "/x.png",
  },
];

const contactLinks = [
  {
    name: "WhatsApp",
    href: "https://wa.me/message/AULNOB4QOL47A1",
    icon: "/whatsapp.png",
    value: "+20 100 000 0000",
  },
  {
    name: "Email",
    href: "memo.memz55@gmail.com",
    icon: "/email.png",
    value: "info@memzacademy.com",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/memz55/?viewAsMember=true&lipi=urn%3Ali%3Apage%3Acompanies_company_index%3B71904f4e-6b8f-4e56-963d-bf7ef19af30e",
    icon: "/linkedin.png",
    value: "Memz Academy",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[var(--memz-page-bg)] py-20 text-[var(--memz-text)]">
      <div className="memz-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--memz-primary)]">
            Contact Memz
          </p>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Contact Us</h1>
          <p className="mt-4 text-lg leading-8 text-[var(--memz-muted)]">
            Reach out to Memz Academy for support, enrollment, and inquiries.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <section className="rounded-[32px] border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold">Social Media</h2>
              <p className="mt-2 text-[var(--memz-muted)]">
                Follow Memz Academy and stay connected everywhere.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-4 rounded-[24px] border border-[var(--memz-border)] bg-[var(--memz-soft)] p-4 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm">
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={42}
                      height={42}
                      className="rounded-xl object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-sm text-[var(--memz-muted)]">
                      Visit our {item.name} page
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold">Contact Channels</h2>
              <p className="mt-2 text-[var(--memz-muted)]">
                Reach us directly for questions, support, and partnerships.
              </p>
            </div>

            <div className="grid gap-4">
              {contactLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-4 rounded-[24px] border border-[var(--memz-border)] bg-white p-4 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[var(--memz-soft)] shadow-sm">
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={42}
                      height={42}
                      className="rounded-xl object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-sm text-[var(--memz-muted)]">
                      {item.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}