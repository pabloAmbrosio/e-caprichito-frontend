import type { GetStaticPropsResult } from 'next';

type StaticPropsFetcher<T> = () => Promise<GetStaticPropsResult<T>>;

export async function withStaticPropsLogging<T>(
  pageName: string,
  fetcher: StaticPropsFetcher<T>,
): Promise<GetStaticPropsResult<T>> {
  try {
    return await fetcher();
  } catch (error) {
    console.error(`[${pageName} getStaticProps]`, {
      timestamp: new Date().toISOString(),
      error,
    });
    throw error;
  }
}
