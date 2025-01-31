import type { ModelMode, ModeWithDefault, ModeWithResolved } from '@/types/model';
import type { Nullable } from '@/types/utils';

export function includeKeys2select<IncludeKey extends string>(includeKeys: IncludeKey[]): Record<IncludeKey, true> {
  return Object.fromEntries(includeKeys.map((key) => [key, true])) as Record<IncludeKey, true>;
}

export function matchWithResolved<Mode extends ModelMode, R, D>(
  __rawResolved: Nullable<R>,
  transform: (resolved: R) => D,
) {
  if (__rawResolved != null) {
    return {
      rawResolved: __rawResolved,
      dataResolved: transform(__rawResolved),
    };
  } else {
    return {
      rawResolved: null as ModeWithResolved<Mode, R>,
      dataResolved: null as ModeWithResolved<Mode, D>,
    };
  }
}

export function matchWithDefault<Mode extends ModelMode, R, D>(
  __rawResolved: Nullable<R>,
  transform: (resolved: R) => D,
) {
  if (__rawResolved != null) {
    return transform(__rawResolved) as ModeWithDefault<Mode, D>;
  } else {
    return null as ModeWithDefault<Mode, D>;
  }
}
