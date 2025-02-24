import * as React from "react";
import Header from "../header";
import Footer from "../footer";
import Navigation from "../navigation";
import { GatsbySeo } from 'gatsby-plugin-next-seo';

const Light = ({ children, title, description }) => {
    // const { title, description } = useSiteMetadata();
    return (
        <div>
            <Navigation />

            <Header />
            
            <GatsbySeo
            title='Using More of Config'
            description='This example uses more of the available config options.'
            canonical='https://www.canonical.ie/'
            openGraph={{
                url: 'https://www.url.ie/a',
                title: 'Open Graph Title',
                description: 'Open Graph Description',
                images: [
                {
                    url: 'https://www.example.ie/og-image-01.jpg',
                    width: 800,
                    height: 600,
                    alt: 'Og Image Alt',
                },
                {
                    url: 'https://www.example.ie/og-image-02.jpg',
                    width: 900,
                    height: 800,
                    alt: 'Og Image Alt Second',
                },
                { url: 'https://www.example.ie/og-image-03.jpg' },
                { url: 'https://www.example.ie/og-image-04.jpg' },
                ],
                site_name: 'SiteName',
            }}
            twitter={{
                handle: '@handle',
                site: '@site',
                cardType: 'summary_large_image',
            }}
            />
            <div className="container mx-auto px-4 py-8">
            {children}
            </div>
            <Footer />
        </div>
    );
};

export default Light;
