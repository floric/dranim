import { DataType } from './sockets';

export interface FilterFunction<T, A> {
  apply: (value: T, args: A) => boolean;
}

export interface FilterApplication {
  name: string;
}

export interface EqualsFilter<T> {
  compareTo: T;
}

export enum ThresholdFilterOperator {
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN = 'GREATER_THAN'
}

export enum FilterFunctions {
  EQUALS = 'equals',
  THRESHOLD = 'threshold',
  CONTAINS = 'contains'
}

export interface StringContainsFilter {
  searchTerm: string;
}

export interface ThresholdFilter<T> {
  threshold: T;
  operator: ThresholdFilterOperator;
}

export interface FilterMethodsPayload
  extends Partial<{
      [DataType.NUMBER]: {
        [FilterFunctions.THRESHOLD]: Array<
          ThresholdFilter<number> & FilterApplication
        >;
        [FilterFunctions.EQUALS]: Array<
          EqualsFilter<number> & FilterApplication
        >;
      };
      [DataType.STRING]: {
        [FilterFunctions.EQUALS]: Array<
          EqualsFilter<string> & FilterApplication
        >;
        [FilterFunctions.CONTAINS]: Array<
          StringContainsFilter & FilterApplication
        >;
      };
      [DataType.BOOLEAN]: {
        [FilterFunctions.EQUALS]: Array<
          EqualsFilter<boolean> & FilterApplication
        >;
      };
      [DataType.DATE]: {
        [FilterFunctions.EQUALS]: Array<EqualsFilter<Date> & FilterApplication>;
      };
    }> {}

export interface SupportedFilterMethods {
  [DataType.NUMBER]: {
    [FilterFunctions.THRESHOLD]: FilterFunction<
      number,
      ThresholdFilter<number>
    >;
    [FilterFunctions.EQUALS]: FilterFunction<number, EqualsFilter<number>>;
  };
  [DataType.STRING]: {
    [FilterFunctions.EQUALS]: FilterFunction<string, EqualsFilter<string>>;
    [FilterFunctions.CONTAINS]: FilterFunction<string, StringContainsFilter>;
  };
  [DataType.BOOLEAN]: {
    [FilterFunctions.EQUALS]: FilterFunction<boolean, EqualsFilter<boolean>>;
  };
  [DataType.DATE]: {
    [FilterFunctions.EQUALS]: FilterFunction<Date, EqualsFilter<Date>>;
  };
}

export const supportedFilters: SupportedFilterMethods = {
  [DataType.NUMBER]: {
    [FilterFunctions.EQUALS]: {
      apply: (value, args) => value === args.compareTo
    },
    [FilterFunctions.THRESHOLD]: {
      apply: (value, args) =>
        args.operator === ThresholdFilterOperator.GREATER_THAN
          ? value > args.threshold
          : value < args.threshold
    }
  },
  [DataType.STRING]: {
    [FilterFunctions.EQUALS]: {
      apply: (value, args) => value === args.compareTo
    },
    [FilterFunctions.CONTAINS]: {
      apply: (value, args) => value.includes(args.searchTerm)
    }
  },
  [DataType.BOOLEAN]: {
    [FilterFunctions.EQUALS]: {
      apply: (value, args) => value === args.compareTo
    }
  },
  [DataType.DATE]: {
    [FilterFunctions.EQUALS]: {
      apply: (value, args) => value === args.compareTo
    }
  }
};
