declare module 'virtual:starlight/user-config' {
  const Config: import('@astrojs/starlight/types').StarlightConfig;

  export default Config;
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
