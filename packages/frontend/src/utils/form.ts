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

export interface TryOperationArgs<T> extends TryArgs<T> {
  op: () => Promise<T>;
}

export interface TryMutationArgs<T, Fallback = null> extends TryArgs<T> {
  op: () => Promise<void | FetchResult<T>>;
  fallback?: Fallback;
}

export const tryOperation = async <T>(
  args: TryOperationArgs<T>
): Promise<T | null> => {
  const {
    op,
    onFail,
    successTitle = () => 'Operation successful',
    successMessage = () => 'Operation done successfully.',
    failedTitle = 'Operation failed',
    failedMessage = 'Operation has failed.'
  } = args;
  try {
    const res = await op();

    if (successTitle !== null) {
      showNotificationWithIcon({
        icon: 'success',
        content: successMessage(res),
        title: successTitle(res)
      });
    }

    return res;
  } catch (err) {
    console.error(err);
    if (onFail) {
      onFail();
    }

    if (failedTitle !== null) {
      showNotificationWithIcon({
        icon: 'error',
        content: failedMessage,
        title: failedTitle
      });
    }

    return null;
  }
};

export const tryMutation = async <Result, Fallback = null>(
  args: TryMutationArgs<Result, Fallback>
): Promise<Result | Fallback> => {
  const {
    op,
    onFail,
    successTitle = () => 'Operation successful',
    successMessage = () => 'Operation done successfully.',
    failedTitle = 'Operation failed',
    failedMessage = 'Operation has failed.',
    fallback = null
  } = args;
  try {
    const res = await op();
    if (!res) {
      return fallback;
    }

    const { data, errors } = res;
    if (errors && errors.length > 0) {
      throw new Error('Errors happened');
    }

    if (successTitle !== null) {
      showNotificationWithIcon({
        icon: 'success',
        content: successMessage(data),
        title: successTitle(data)
      });
    }

    return data;
  } catch (err) {
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

    return null;
  }
};
