export const sampleHorizonResponse = {
  _links: {
    self: { href: "https://horizon.stellar.org/accounts/GAAQ.../offers?cursor=&limit=20&order=asc" },
    next: { href: "https://horizon.stellar.org/accounts/GAAQ.../offers?cursor=12345&limit=20&order=asc" },
    prev: { href: "https://horizon.stellar.org/accounts/GAAQ.../offers?cursor=12300&limit=20&order=asc" },
  },
  _embedded: {
    records: [
      { id: "1", amount: "100" },
      { id: "2", amount: "200" },
      { id: "3", amount: "300" },
    ],
  },
};

export const sampleLinkHeader = '</accounts/GAAQ.../offers?cursor=12345&limit=20>; rel="next", </accounts/GAAQ.../offers?cursor=12300&limit=20>; rel="prev"';
