import { guidesSource, docsSource } from '@/libs/source';
import { createFromSource } from 'fumadocs-core/search/server';

const sources = { ...guidesSource, ...docsSource };
export const { GET } = createFromSource(sources);
