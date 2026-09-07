'use client';

export default function GlobalError() {
  return (
    <html lang="vi">
      <body>
        <main style={{ fontFamily: "sans-serif", margin: "4rem auto", maxWidth: 720, padding: "0 1.5rem" }}>
          <h1>Something went wrong</h1>
          <p>The website could not render this page.</p>
        </main>
      </body>
    </html>
  );
}
