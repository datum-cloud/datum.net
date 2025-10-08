declare module 'virtual:starlight/user-config' {
  const Config: import('@astrojs/starlight/types').StarlightConfig;

  export default Config;
}

declare module 'virtual:starlight/project-context' {
  export const project: {
    trailingSlash: 'always' | 'never';
  };
}

declare module 'virtual:starlight/pagefind-config' {
  export const pagefindUserConfig: {
    searchButtonText: string;
    searchResultText: string;
    noResultsText: string;
  };
}

declare module 'virtual:starlight/user-images' {
  export const logos: {
    dark?: { src: string; width: number; height: number };
    light?: { src: string; width: number; height: number };
  };
}

declare module 'virtual:starlight/components/MobileTableOfContents' {
  export default import('@astrojs/starlight/components/MobileTableOfContents').default;
}

declare module 'virtual:starlight/components/TableOfContents' {
  export default import('@astrojs/starlight/components/TableOfContents').default;
}

declare module 'virtual:starlight/components/EditLink' {
  export default import('@astrojs/starlight/components/EditLink').default;
}

declare module 'virtual:starlight/components/LastUpdated' {
  export default import('@astrojs/starlight/components/LastUpdated').default;
}

declare module 'virtual:starlight/components/Pagination' {
  export default import('@astrojs/starlight/components/Pagination').default;
}

declare module 'virtual:starlight/user-config' {
  export default import('@astrojs/starlight/user-config').default;
}

declare module 'virtual:starlight/components/MobileMenuToggle' {
  export default import('@astrojs/starlight/components/MobileMenuToggle').default;
}

declare module 'virtual:starlight/componentsc/ThemeToggle' {
  export default import('@astrojs/starlight/components/ThemeToggle').default;
}

declare module 'virtual:starlight/components/LanguageSelect' {
  export default import('@astrojs/starlight/components/LanguageSelect').default;
}

declare module 'virtual:starlight/components/Search' {
  export default import('@astrojs/starlight/components/Search').default;
}

declare module 'virtual:starlight/components/SiteTitle' {
  export default import('@astrojs/starlight/components/SiteTitle').default;
}

declare module 'virtual:starlight/components/SocialIcons' {
  export default import('@astrojs/starlight/components/SocialIcons').default;
}

declare module 'virtual:starlight/components/ThemeSelect' {
  export default import('@astrojs/starlight/components/ThemeSelect').default;
}
