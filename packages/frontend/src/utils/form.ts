import { notification } from 'antd';
import { isApolloError } from 'apollo-client/errors/ApolloError';

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

export interface TryOperationArgs<T> {
  op: () => Promise<T>;
  onFail?: () => any;
  successTitle?: null | SuccessContentFunc<T>;
  successMessage?: SuccessContentFunc<T>;
  failedTitle?: string | null;
  failedMessage?: string;
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
