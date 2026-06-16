import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 300000, // 5 minutes for paper generation
});

// Papers API
export const papersAPI = {
  generate: (topic, wordCount, citationFormat, complexityLevel = "master", domain = "general") =>
    apiClient.post("/papers", {
      topic,
      word_count: wordCount,
      citation_format: citationFormat,
      complexity_level: complexityLevel,
      domain: domain,
    }),
  list: (page = 1, perPage = 10) =>
    apiClient.get("/papers", { params: { page, per_page: perPage } }),
  get: (id) => apiClient.get(`/papers/${id}`),
  delete: (id) => apiClient.delete(`/papers/${id}`),
  export: (id, format = "txt") =>
    apiClient.get(`/papers/${id}/export`, { params: { format } }),
};

// Research API
export const researchAPI = {
  collect: (topic, maxResults = 50) =>
    apiClient.post("/research/collect", { topic, max_results: maxResults }),
  validateSources: (sources, topic) =>
    apiClient.post("/research/sources/validate", { sources, topic }),
};

// Citations API
export const citationsAPI = {
  getFormats: () => apiClient.get("/citations/formats"),
  formatCitation: (source, style, sourceType = "journal") =>
    apiClient.post("/citations/format-citation", {
      source,
      style,
      source_type: sourceType,
    }),
  formatBibliography: (sources, style) =>
    apiClient.post("/citations/format-bibliography", {
      sources,
      style,
    }),
};

// SciBot API
export const scibotAPI = {
  chat: (paperId, message, history) =>
    apiClient.post("/scibot/chat", { paper_id: paperId, message, history }),
};
