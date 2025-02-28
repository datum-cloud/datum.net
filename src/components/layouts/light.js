import * as React from "react"
import Header from "../header"
import Footer from "../footer"
import Navigation from "../navigation"
import useSiteMetadata from "../sitemetadata"
import { GatsbySeo } from 'gatsby-plugin-next-seo'

const Light = ({ children, title, description, canonical, openGraph, twitter, ...restSeoProps }) => {
    const siteMetadata = useSiteMetadata();
    
    const url = (restSeoProps && restSeoProps.path) ? siteMetadata.url + restSeoProps.path : siteMetadata.url;

    const seoProps = {
        title: `${siteMetadata.title} - ${title}`,
        description: description || `${siteMetadata.description} - Official Website`,
        canonical: canonical || siteMetadata.url,
        openGraph: {
            title: (openGraph && openGraph.title) || title || siteMetadata.title,
            description: (openGraph && openGraph.description) || siteMetadata.description || `${siteMetadata.title} - Official Website`,
            url: url || canonical || siteMetadata.url,
            type: (openGraph && openGraph.type) || 'website',
            site_name: (openGraph && openGraph.site_name) || siteMetadata.title,
            images: (openGraph && openGraph.images) || [
            {
                url: `${siteMetadata.url}/og-image.jpg`,
                width: 800,
                height: 600,
                alt: `${siteMetadata.title} - Featured Image`,
            },
            ],
            ...openGraph
        },
        twitter: {
            handle: (twitter && twitter.handle) || '@handle',
            site: (twitter && twitter.site) || '@site',
            cardType: (twitter && twitter.cardType) || 'summary_large_image',
            ...twitter
        },
        ...restSeoProps
    }

    return (
        <div>
            <Navigation />

            <Header />
            
            <GatsbySeo {...seoProps} />

            <div className="container mx-auto px-4 py-8">
            {children}
            </div>
            
            <Footer />
        </div>
    );
};

export default Light;
