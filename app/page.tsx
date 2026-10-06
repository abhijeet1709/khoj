"use client";

import { FormEvent, useState } from "react";

type Result = {
  title: string;
  url: string;
  content?: string;
  engines?: string[];

  // Image results from SearXNG
  img_src?: string;
  thumbnail_src?: string;
  img_format?: string;
};

const tabs = [
  { label: "Web", category: "general" },
  { label: "News", category: "news" },
  { label: "Images", category: "images" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function performSearch(searchQuery: string, category: string) {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) return;

    setLoading(true);
    setSearched(true);
    setError("");

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(
          trimmedQuery
        )}&category=${encodeURIComponent(category)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed");
      }

      setResults(data.results || []);
    } catch (err) {
      setResults([]);
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    await performSearch(query, activeTab);
  }

  function changeTab(category: string) {
    setActiveTab(category);

    if (query.trim()) {
      performSearch(query, category);
    }
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setSearched(false);
    setError("");
  }

  function searchSuggestion(item: string) {
    setQuery(item);
    performSearch(item, activeTab);
  }

  const isImageSearch = activeTab === "images";

  return (
    <main className="search-page">
      <header className={`hero ${searched ? "compact" : ""}`}>
        <div className="brand">
          <span className="brand-mark">K</span>
          <span>KHOJ</span>
        </div>

        {!searched && (
          <p className="tagline">
            Search the web. Your way.
          </p>
        )}

        <form
          id="search-form"
          onSubmit={handleSearch}
          className="search-form"
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the web..."
            autoFocus
          />

          {query && (
            <button
              type="button"
              className="clear-button"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              ×
            </button>
          )}

          <button
            type="submit"
            className="search-button"
            aria-label="Search"
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </button>
        </form>

        <nav className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.category}
              type="button"
              className={
                activeTab === tab.category ? "active" : ""
              }
              onClick={() => changeTab(tab.category)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {searched && (
        <section
          className={`results-area ${
            isImageSearch ? "image-results-area" : ""
          }`}
        >
          {loading && (
            <div className="status">
              <div className="spinner" />
              Searching the web...
            </div>
          )}

          {error && <div className="error">{error}</div>}

          {!loading && !error && results.length === 0 && (
            <div className="status">
              No results found.
            </div>
          )}

          {/* IMAGE RESULTS */}
          {!loading &&
            !error &&
            isImageSearch &&
            results.length > 0 && (
              <div className="image-grid">
                {results.map((result, index) => {
                  const imageUrl =
                    result.thumbnail_src || result.img_src;

                  return (
                    <a
                      key={`${result.url}-${index}`}
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="image-card"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={result.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="image-placeholder">
                          No image
                        </div>
                      )}

                      <div className="image-info">
                        <div className="image-title">
                          {result.title}
                        </div>

                        {result.engines &&
                          result.engines.length > 0 && (
                            <div className="image-engine">
                              {result.engines[0]}
                            </div>
                          )}
                      </div>
                    </a>
                  );
                })}
              </div>
            )}

          {/* WEB / NEWS RESULTS */}
          {!loading &&
            !error &&
            !isImageSearch &&
            results.map((result, index) => (
              <article
                className="result-card"
                key={`${result.url}-${index}`}
              >
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="result-title"
                >
                  {result.title}
                </a>

                <div className="result-url">
                  {result.url}
                </div>

                {result.content && (
                  <p className="result-content">
                    {result.content}
                  </p>
                )}

                {result.engines &&
                  result.engines.length > 0 && (
                    <div className="engines">
                      {result.engines.map((engine) => (
                        <span key={engine}>{engine}</span>
                      ))}
                    </div>
                  )}
              </article>
            ))}
        </section>
      )}

      {!searched && (
        <section className="quick-section">
          <p>Try searching for</p>

          <div className="suggestions">
            {[
              "AWS Lambda",
              "Next.js",
              "Machine Learning",
              "Cloud Computing",
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => searchSuggestion(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      )}

      <footer>
        <span>KHOJ</span>
        <span>Private metasearch</span>
        <span>Powered by SearXNG</span>
      </footer>
    </main>
  );
}