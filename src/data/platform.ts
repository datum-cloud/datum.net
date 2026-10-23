// src/data/platform.ts

import type { IconName } from '@utils/iconMap';
import type { FooterCtaButton } from '@/src/types/common';

const SIGNUP_URL = 'https://auth.datum.net/id/signup';
const DOCS_URL = 'https://www.datum.net/docs';
const DISCORD_URL = 'https://link.datum.net/discord';

export const hero = {
  /** Rendered on two lines from md up; the accent closes the second line. */
  titleLines: ['Get a free virtual backbone', 'in the next'],
  titleAccent: '60 seconds.',
  title: 'Get a free virtual backbone in the next 60 seconds.',
  description:
    'Every big cloud uses a private internet backbone to control traffic, lower costs, improve performance and enhance security. With Galactic VPC, you can start unlocking those same benefits in minutes, not months or years.',
  cta: { text: 'Start for free', href: SIGNUP_URL },
  footnote: 'Galactic VPC spans clouds & providers. Built with SRv6. Backed by open source.',
};

export type BackboneStopId = 'gke' | 'mac' | 'tailscale' | 'datum' | 's3' | 'enterprise';

export interface BackboneStop {
  id: BackboneStopId;
  /** Card copy, one entry per rendered line. */
  lines: [string, string];
}

/** Resource cards hanging off the backbone in the hero illustration, left to right. */
export const backboneStops: BackboneStop[] = [
  { id: 'gke', lines: ['A workload', 'in GKE'] },
  { id: 'mac', lines: ['The Mac mini', 'on your desk'] },
  { id: 'tailscale', lines: ['Tailscale', 'mesh network'] },
  { id: 'datum', lines: ['Datum microVM', 'with an ALB'] },
  { id: 's3', lines: ['S3 storage bucket', 'in US East'] },
  { id: 'enterprise', lines: ['Onramp to', 'an Enterprise'] },
];

export interface ResourceItem {
  icon: IconName;
  title: string;
  description?: string;
  soon?: boolean;
}

export interface ResourceList {
  title: string;
  items: ResourceItem[];
}

export const galactic = {
  eyebrow: 'What’s Galactic?',
  titleLead: 'Just like a public cloud VPC,',
  titleAccent: 'but everywhere.',
  description: [
    'Attach resources from your desktop to your database to start unlocking better visibility, control and performance.',
    'Spin up one, dozens or thousands. As we like to say: agents need VPCs, too!',
  ],
  lists: [
    {
      title: 'Datum Cloud resources',
      items: [
        {
          icon: 'server',
          title: 'Compute',
          description: 'Secure microVMs that boot in milliseconds',
        },
        {
          icon: 'globe-lock',
          title: 'Zero Trust Tunnels',
          description: 'Flexible and private. We ♥ QUIC + MASQUE!',
        },
        {
          icon: 'shield-ban',
          title: 'Protection',
          description: 'A WAF to defend against common attacks',
        },
        {
          icon: 'workflow',
          title: 'ALB / GSLB',
          description: 'Proxy and route traffic. Powered by Envoy',
        },
        {
          icon: 'database',
          title: 'Object Storage',
          description: 'S3 compatible with zero egress fees',
          soon: true,
        },
        {
          icon: 'cloud',
          title: 'Cloud Interconnects',
          description: 'Private connect to clouds and enterprises',
          soon: true,
        },
      ],
    },
    {
      title: 'Example 3rd party resources',
      items: [
        { icon: 'cable', title: 'Tailscale Tailnets' },
        { icon: 'route', title: 'Mac Mini on your desk' },
        { icon: 'cloud', title: 'Workloads in AWS or GCP' },
        { icon: 'container', title: 'Agentic sandboxes at Daytona or Modal' },
        { icon: 'cpu', title: 'Private infrastructure / colocation' },
        { icon: 'building', title: 'GPU infrastructure from a neocloud' },
      ],
    },
  ] as ResourceList[],
  docs: {
    text: 'Read about all Datum Cloud resources in our docs',
    cta: { text: 'View docs', href: DOCS_URL },
  },
};

export interface PlatformFeature {
  icon: IconName;
  title: string;
  description: string;
}

export const features = {
  eyebrow: 'Features',
  title: 'A modern experience for agents and developers',
  description: 'We built our platform for Claude and Codex, then removed all the sales gates.',
  items: [
    { icon: 'terminal', title: 'datumctl', description: 'K8s-style CLI: get, apply, delete.' },
    {
      icon: 'shield-check',
      title: 'Fine-Grained Permissions',
      description: 'Groups and fine-grained IAM role assignments.',
    },
    { icon: 'key', title: 'Secrets', description: 'Protect sensitive data in one place.' },
    {
      icon: 'activity',
      title: 'Metrics Export',
      description: 'Full OTel metrics to Grafana Cloud, with prebuilt dashboards.',
    },
    {
      icon: 'scroll-text',
      title: 'Audit & Activity Logs',
      description: 'Built-in audit and activity logging.',
    },
    { icon: 'log-in', title: 'SSO', description: 'Enterprise-grade authentication.' },
    {
      icon: 'bot',
      title: 'Service Accounts',
      description: 'Give agents and apps their own identity. Let the machines do the rest.',
    },
    {
      icon: 'plug',
      title: 'Datum MCP',
      description: 'Official self-hosted MCP server, tightly integrated with Cursor.',
    },
    {
      icon: 'sparkles',
      title: 'AI Assistant',
      description: 'Ask datumctl about your resources in plain English.',
    },
    {
      icon: 'at-sign',
      title: 'Domains',
      description: 'Manage domains programmatically across providers.',
    },
    {
      icon: 'laptop',
      title: 'Desktop Apps',
      description: 'macOS, Windows, and Linux apps for exposing localhost to the internet.',
    },
  ] satisfies PlatformFeature[],
};

export const prefooter = {
  titleLead: 'Take control of',
  titleAccent: 'your',
  title: 'infrastructure,',
  titleTail: 'no matter where it is.',
  description: 'Datum Cloud is free during public beta.',
  buttons: [
    {
      text: 'Start for free',
      href: SIGNUP_URL,
      class: 'btn btn--midnight-fjord btn--glow-aurora',
      icon: { name: 'arrow-right', size: 'md' },
      target: '_blank',
      event: 'Platform pre-footer: Start for free',
    },
    {
      text: 'Chat with us on Discord',
      href: DISCORD_URL,
      class: 'btn btn--alpha',
      target: '_blank',
      event: 'Platform pre-footer: Chat on Discord',
    },
  ] satisfies FooterCtaButton[],
};
