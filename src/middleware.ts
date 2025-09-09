import { stargazerCount } from '@utils/github';

interface Context {
  locals: {
    starCount?: string;
  };
}

type NextFunction = () => Promise<void>;

export async function onRequest(context: Context, next: NextFunction) {
  const starCount = await stargazerCount('datum-cloud', 'datum');
  const formatter = new Intl.NumberFormat('en-US', { notation: 'compact' });
  const formattedStarCount = formatter.format(starCount);

  context.locals.starCount = formattedStarCount;

  return next();
}
