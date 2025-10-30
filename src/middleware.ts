import { stargazerCount } from '@libs/datum';
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const tempStarCount = await stargazerCount();

  const formatter = new Intl.NumberFormat('en-US', { notation: 'compact' });
  const formattedStarCount = formatter.format(tempStarCount);

  context.locals.starCount = () => formattedStarCount;

  return next();
});
