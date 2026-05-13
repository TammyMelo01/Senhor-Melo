"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

type SearchResult = {
  id: string;
  type: string;
  title: string;
  description: string;
  href: string;
};

export default function BuscaPage() {
  const params = useSearchParams();
  const q = params.get("q") || "";
  const familyId = params.get("familyId") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function search() {
      setLoading(true);

      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}&familyId=${encodeURIComponent(familyId)}`);
      const data = await response.json();

      setResults(data.results || []);
      setLoading(false);
    }

    if (q) search();
  }, [q, familyId]);

  return (
    <>
      <section className="hero-section">
        <span className="badge">Busca global</span>
        <h1>Resultados para “{q}”.</h1>
        <p className="lead">
          Pesquise em agenda, finanças, vacinas, lista de compras e membros da família.
        </p>
      </section>

      <section className="panel-card">
        <h2>
          <Search size={22} />
          {loading ? "Buscando..." : `${results.length} resultado(s) encontrado(s)`}
        </h2>

        {!loading && results.length === 0 && (
          <p className="empty-list">Nenhum resultado encontrado.</p>
        )}

        <div className="summary-list">
          {results.map((item) => (
            <Link href={item.href} key={`${item.type}-${item.id}`}>
              <article>
                <div>
                  <strong>{item.type} • {item.title}</strong>
                  <span>{item.description}</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
