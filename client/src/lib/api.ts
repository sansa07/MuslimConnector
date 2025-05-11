import { apiRequest } from "./queryClient";

export const API_BASE_URL = "/api";

// Prayer Times API
export async function fetchPrayerTimes(city?: string) {
  const url = `${API_BASE_URL}/prayer-times${city ? `?city=${city}` : ''}`;
  const response = await apiRequest("GET", url, undefined);
  return response.json();
}

// Quran API
export async function fetchDailyVerse() {
  const response = await apiRequest("GET", `${API_BASE_URL}/quran/daily`, undefined);
  return response.json();
}

export async function fetchRandomVerse() {
  const response = await apiRequest("GET", `${API_BASE_URL}/quran/random`, undefined);
  return response.json();
}

export async function searchQuran(query: string, surahId?: string) {
  const url = `${API_BASE_URL}/quran/search?query=${query}${surahId ? `&surahId=${surahId}` : ''}`;
  const response = await apiRequest("GET", url, undefined);
  return response.json();
}

export async function fetchSurahs() {
  const response = await apiRequest("GET", `${API_BASE_URL}/quran/surahs`, undefined);
  return response.json();
}

// Hadith API
export async function fetchRandomHadith() {
  const response = await apiRequest("GET", `${API_BASE_URL}/hadith/random`, undefined);
  return response.json();
}

export async function searchHadith(query: string, bookId?: string) {
  const url = `${API_BASE_URL}/hadith/search?query=${query}${bookId ? `&bookId=${bookId}` : ''}`;
  const response = await apiRequest("GET", url, undefined);
  return response.json();
}

export async function fetchHadithBooks() {
  const response = await apiRequest("GET", `${API_BASE_URL}/hadith/books`, undefined);
  return response.json();
}

// Posts API
export async function fetchPosts() {
  const response = await apiRequest("GET", `${API_BASE_URL}/posts`, undefined);
  return response.json();
}

export async function createPost(data: { content: string; type: string }) {
  const response = await apiRequest("POST", `${API_BASE_URL}/posts`, data);
  return response.json();
}

export async function likePost(postId: string) {
  const response = await apiRequest("POST", `${API_BASE_URL}/posts/${postId}/like`, {});
  return response.json();
}

export async function savePost(postId: string) {
  const response = await apiRequest("POST", `${API_BASE_URL}/posts/${postId}/save`, {});
  return response.json();
}

export async function commentOnPost(postId: string, text: string) {
  const response = await apiRequest("POST", `${API_BASE_URL}/posts/${postId}/comment`, { text });
  return response.json();
}

// Dua Requests API
export async function fetchDuaRequests() {
  const response = await apiRequest("GET", `${API_BASE_URL}/dua-requests`, undefined);
  return response.json();
}

export async function createDuaRequest(content: string) {
  const response = await apiRequest("POST", `${API_BASE_URL}/dua-requests`, { content });
  return response.json();
}

export async function prayForRequest(requestId: string) {
  const response = await apiRequest("POST", `${API_BASE_URL}/dua-requests/${requestId}/pray`, {});
  return response.json();
}

// Events API
export async function fetchEvents() {
  const response = await apiRequest("GET", `${API_BASE_URL}/events`, undefined);
  return response.json();
}

export async function createEvent(eventData: any) {
  const response = await apiRequest("POST", `${API_BASE_URL}/events`, eventData);
  return response.json();
}

export async function attendEvent(eventId: string) {
  const response = await apiRequest("POST", `${API_BASE_URL}/events/${eventId}/attend`, {});
  return response.json();
}

// Communities API
export async function fetchCommunities() {
  const response = await apiRequest("GET", `${API_BASE_URL}/communities`, undefined);
  return response.json();
}

export async function createCommunity(data: { name: string; description: string }) {
  const response = await apiRequest("POST", `${API_BASE_URL}/communities`, data);
  return response.json();
}

export async function joinCommunity(communityId: string) {
  const response = await apiRequest("POST", `${API_BASE_URL}/communities/${communityId}/join`, {});
  return response.json();
}

// Profile API
export async function fetchProfile() {
  const response = await apiRequest("GET", `${API_BASE_URL}/profile`, undefined);
  return response.json();
}

export async function updateProfile(data: any) {
  const response = await apiRequest("PATCH", `${API_BASE_URL}/profile`, data);
  return response.json();
}

export async function fetchUserPosts() {
  const response = await apiRequest("GET", `${API_BASE_URL}/profile/posts`, undefined);
  return response.json();
}

export async function fetchSavedPosts() {
  const response = await apiRequest("GET", `${API_BASE_URL}/profile/saved`, undefined);
  return response.json();
}
