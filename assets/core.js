export function dailyArticle(articles, date = new Date()) {
  if (!Array.isArray(articles) || !articles.length || Number.isNaN(date.getTime())) return null;
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  return articles[((day % articles.length) + articles.length) % articles.length];
}
export function filterArticles(articles, query = '', category = 'all') {
  const words = query.trim().toLocaleLowerCase('en').split(/\s+/).filter(Boolean);
  return articles.filter(a => (category === 'all' || a.category === category) && words.every(w => `${a.title} ${a.keywords.join(' ')}`.toLocaleLowerCase('en').includes(w)));
}
export function randomArticle(articles, previousId, category = 'all', rng = Math.random) {
  const pool = articles.filter(a => category === 'all' || a.category === category);
  const alternatives = pool.filter(a => a.id !== previousId);
  const choices = alternatives.length ? alternatives : pool;
  return choices.length ? choices[Math.min(choices.length - 1, Math.floor(rng() * choices.length))] : null;
}
export function parseCollection(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.favourites) || value.favourites.length > 10000 || !value.favourites.every(id => typeof id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) && id.length <= 150)) throw new Error('This is not a valid Little Wonder collection (version 1). Your current collection has not changed.');
  return [...new Set(value.favourites)];
}
export function mergeCollection(existing, incoming) { return [...new Set([...existing, ...incoming])]; }
