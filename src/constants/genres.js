export const GENRES = [
  {
    id: "all",
    label: "すべて",
    shortLabel: "全ジャンル",
    description: "全てのニュースジャンルを表示します。",
  },
  {
    id: "politics_policy",
    label: "政治・政策",
    shortLabel: "政治",
    description: "政治・政策に関するニュース。",
  },
  {
    id: "economy_finance",
    label: "経済・金融",
    shortLabel: "経済",
    description: "経済・金融・マーケットに関するニュース。",
  },
  {
    id: "entertainment_culture",
    label: "エンタメ・カルチャー（映画/音楽/配信）",
    shortLabel: "エンタメ",
    description: "映画・音楽・配信など文化系トピックのニュース。",
  },
  {
    id: "tech_ai",
    label: "テック・AI",
    shortLabel: "テック",
    description: "テクノロジー・AI関連のニュース。",
  },
  {
    id: "career_workstyle",
    label: "キャリア・働き方",
    shortLabel: "キャリア",
    description: "キャリア形成や働き方に関するニュース。",
  },
];

export const GENRE_MAP = Object.fromEntries(GENRES.map((genre) => [genre.id, genre]));

export const getGenreById = (genreId) => GENRE_MAP[genreId] ?? null;
