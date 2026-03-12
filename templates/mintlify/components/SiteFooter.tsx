import { Icon } from '@mintlify/components';
import { MintlifyLogo } from '../icons/MintlifyLogo';

const socialIconMap: Record<string, string> = {
  x: 'x-twitter',
  github: 'github',
  linkedin: 'linkedin',
  discord: 'discord',
  youtube: 'youtube',
  twitter: 'x-twitter',
};

interface Props {
  socials?: Record<string, string>;
}

export default function SiteFooter({ socials = {} }: Props) {
  return (
    <footer className="mt-24 border-t border-gray-200">
      <div className="flex items-center justify-between gap-12 py-10">
        <div className="flex flex-wrap gap-6">
          {Object.entries(socials).map(([type, url]) => {
            const iconName = socialIconMap[type.toLowerCase()] || type;
            return (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-gray-600"
                aria-label={type}
              >
                <Icon icon={iconName} size={20} color="currentColor" />
              </a>
            );
          })}
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-gray-600">
          <a
            href="https://www.mintlify.com?utm_campaign=poweredBy&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-baseline gap-1"
          >
            <span>Powered by</span>
            <MintlifyLogo className="h-4 w-auto translate-y-0.75" />
          </a>
        </div>
      </div>
    </footer>
  );
}
