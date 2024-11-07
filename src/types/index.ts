interface Article {
  title: string;
  link: string;
  [key: string]: any;
}

interface Badge {
  name: string;
  logo?: string;
}

interface BadgeData {
  name: string;
  logo: string;
  color: string;
}

interface Social {
  name: string;
  logo?: string;
  color?: string;
  url?: string;
  username?: string;
}

export interface Config {
  mediumArticles: {
    username: string;
    enabled: boolean;
    numberOfArticles?: number;
  };
  badges: {
    enabled: boolean;
    list: Badge[];
    spectrum: string[];
  };
  github: {
    username: string;
    colors: {
      title: string;
      text: string;
      icon: string;
      background: string;
    };
    stats: {
      mostUsedLanguages: boolean;
      overallStats: boolean;
    };
    highlightedRepos: string[];
  };
  social: Social[];
  instagram: {
    username: string;
    enabled: boolean;
    numberOfImages?: number;
  };
}

export interface InputData {
  articles?: { articles: Article[] };
  badges?: { badges: BadgeData[] };
  refreshDate?: { refreshDate: string };
  github?: { github: any };
  social?: { social: Array<{ name: string; logo: string }> };
  instagram?: { instagram: any };
}
