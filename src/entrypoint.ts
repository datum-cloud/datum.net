import type { Alpine } from 'alpinejs';
import collapse from '@alpinejs/collapse';
import { registerInfoTooltip } from './libs/tooltip';

export default (Alpine: Alpine) => {
  Alpine.plugin(collapse);
  registerInfoTooltip(Alpine);
};
