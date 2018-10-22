import { notification } from 'antd';
import { isApolloError } from 'apollo-client/errors/ApolloError';
import { FetchResult } from 'react-apollo';

export interface NotificationArguments {
  icon: 'success' | 'error' | 'info' | 'warning';
  title: string;
  content: string;
  position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}

export type SuccessContentFunc<T> = (res: T) => string;

export const showNotificationWithIcon = (args: NotificationArguments) => {
  notification.config({
    placement: args.position || 'bottomRight'
  });
  notification[args.icon]({
    message: args.title,
    description: args.content
  });
};

export const hasErrors = (fieldsError: any) => {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
};

interface TryArgs<T> {
  onFail?: () => any;
  successTitle?: null | SuccessContentFunc<T>;
  successMessage?: SuccessContentFunc<T>;
  failedTitle?: string | null;
  failedMessage?: string;
}

export interface TryMutationArgs<T, Fallback = null> extends TryArgs<T> {
  op: () => Promise<void | FetchResult<T>>;
  fallback?: Fallback;
}

export const tryMutation = async <Result, Fallback = null>(
  args: TryMutationArgs<Result, Fallback>
): Promise<Result | Fallback> => {
  const { op, fallback = null } = args;
  try {
    const res = await op();
    if (!res) {
      return fallback;
    }

    const { data, errors } = res;
    checkErrors(errors);
    showSuccess(data, args);

    return data;
  } catch (err) {
    processFailure(err, args);
    return null;
  }
};

const checkErrors = (errors: Array<Error>) => {
  if (errors && errors.length > 0) {
    throw new Error('Errors happened');
  }
};

const showSuccess = <Result, Fallback = null>(
  data: Result,
  {
    successTitle = () => 'Operation successful',
    successMessage = () => 'Operation done successfully.'
  }: TryMutationArgs<Result, Fallback>
) => {
  if (successTitle !== null) {
    showNotificationWithIcon({
      icon: 'success',
      content: successMessage(data),
      title: successTitle(data)
    });
  }
};

const processFailure = <Result, Fallback = null>(
  err: Error,
  {
    onFail,
    failedTitle = 'Operation failed',
    failedMessage = 'Operation has failed.'
  }: TryMutationArgs<Result, Fallback>
) => {
  console.error(err);

  if (onFail) {
    onFail();
  }

  if (failedTitle !== null) {
    showNotificationWithIcon({
      icon: 'error',
      content:
        isApolloError(err) && err.graphQLErrors.length > 0
          ? `${failedMessage} ${err.graphQLErrors[0].message}`
          : failedMessage,
      title: failedTitle
    });
  }
};
