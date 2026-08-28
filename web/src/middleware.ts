import { NextRequest, NextResponse } from 'next/server';
import { LANGUAGES } from './i18n/config';

const localeCodes = LANGUAGES.map(({ code }) => code);
const localeSet = new Set<string>(localeCodes);

function getPreferredLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const cookieLanguage = cookieLocale?.toLowerCase();
  if (cookieLanguage && localeSet.has(cookieLanguage)) {
    return cookieLanguage;
  }

  const acceptedLanguages = (request.headers.get('accept-language')?.split(',') ?? [])
    .map((language, index) => {
      const [rawCode, ...parameters] = language.trim().split(';');
      const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith('q='));
      const quality = qualityParameter ? Number(qualityParameter.trim().slice(2)) : 1;

      return {
        code: rawCode.toLowerCase(),
        quality: Number.isNaN(quality) ? 0 : quality,
        index,
      };
    })
    .filter(({ code, quality }) => code !== '*' && quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const language of acceptedLanguages) {
    const exactLocale = localeCodes.find((locale) => locale === language.code);
    if (exactLocale) {
      return exactLocale;
    }

    const baseLocale = language.code.split('-')[0];
    const matchingLocale = localeCodes.find((locale) => locale === baseLocale);
    if (matchingLocale) {
      return matchingLocale;
    }
  }

  return 'en';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const originalPathname = new URL(request.url).pathname;
  const firstSegment = pathname.split('/')[1];
  const originalFirstSegment = originalPathname.split('/')[1];

  if (localeSet.has(firstSegment) || localeSet.has(originalFirstSegment)) {
    return NextResponse.next();
  }

  const locale = getPreferredLocale(request);
  if (locale === 'en') {
    return NextResponse.next();
  }

  const localizedUrl = request.nextUrl.clone();
  localizedUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(localizedUrl);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
