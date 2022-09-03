import { ChangeEvent, useEffect, useState } from 'react';

import { gifAPIService } from '../../../apis/gifAPIService';
import { GifImageModel } from '../../../models/image/gifImage';

const DEFAULT_PAGE_INDEX = 0;

export const SEARCH_STATUS = {
  BEFORE_SEARCH: 'BEFORE_SEARCH',
  LOADING: 'LOADING',
  FOUND: 'FOUND',
  NO_RESULT: 'NO_RESULT'
} as const;

export type SearchStatus = typeof SEARCH_STATUS[keyof typeof SEARCH_STATUS];

type Cache = { expiresAt?: number };
type TrendingCache = Cache & { gifs?: GifImageModel[] };

const CACHE_TIME = 180000;

const trendingResultCache: TrendingCache = {};

const checkCacheExpired = (cache: Cache) => {
  if (cache.expiresAt === undefined) return true;

  return cache.expiresAt < Date.now();
};

const useGifSearch = () => {
  const [status, setStatus] = useState<SearchStatus>(SEARCH_STATUS.BEFORE_SEARCH);
  const [currentPageIndex, setCurrentPageIndex] = useState(DEFAULT_PAGE_INDEX);
  const [gifList, setGifList] = useState<GifImageModel[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  const updateSearchKeyword = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const resetSearch = () => {
    setStatus(SEARCH_STATUS.LOADING);
    setCurrentPageIndex(DEFAULT_PAGE_INDEX);
  };

  const searchByKeyword = async () => {
    resetSearch();

    const gifs: GifImageModel[] = await gifAPIService.searchByKeyword(
      searchKeyword,
      DEFAULT_PAGE_INDEX
    );

    if (gifs.length === 0) {
      setStatus(SEARCH_STATUS.NO_RESULT);
      return;
    }

    setGifList(gifs);
    setStatus(SEARCH_STATUS.FOUND);
  };

  const loadMore = async () => {
    const nextPageIndex = currentPageIndex + 1;
    const gifs: GifImageModel[] = await gifAPIService.searchByKeyword(searchKeyword, nextPageIndex);

    setGifList([...gifList, ...gifs]);
    setCurrentPageIndex(nextPageIndex);
  };

  useEffect(() => {
    const setTrending = async () => {
      if (status !== SEARCH_STATUS.BEFORE_SEARCH) return;

      if (trendingResultCache.gifs === undefined || checkCacheExpired(trendingResultCache)) {
        trendingResultCache.gifs = await gifAPIService.getTrending();
        trendingResultCache.expiresAt = Date.now() + CACHE_TIME;
      }

      setGifList(trendingResultCache.gifs);
    };

    setTrending();

    return () => setStatus(SEARCH_STATUS.LOADING);
  }, []);

  return {
    status,
    searchKeyword,
    gifList,
    searchByKeyword,
    updateSearchKeyword,
    loadMore
  } as const;
};

export default useGifSearch;
