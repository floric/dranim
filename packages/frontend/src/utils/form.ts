import { notification } from 'antd';
import { ApolloQueryResult } from 'apollo-boost';
import { isApolloError } from 'apollo-client/errors/ApolloError';

export interface NotificationArguments {
  icon: 'success' | 'error' | 'info' | 'warning';
  title: string;
  content: string;
  position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}

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
  successTitle?: string;
  successMessage?: string;
  failedTitle?: string;
  failedMessage?: string;
  refetch?: () => Promise<ApolloQueryResult<any>>;
}

export const tryOperation = async <T>(
  args: TryOperationArgs<T>
): Promise<T | null> => {
  const {
    op,
    refetch,
    successTitle = 'Operation successfull',
    successMessage = 'Operation successfully done.',
    failedTitle = 'Operation failed',
    failedMessage = 'Operation execution has failed.'
  } = args;
  try {
    const res = await op();

    if (refetch) {
      await refetch();
    }

    showNotificationWithIcon({
      icon: 'success',
      content: successMessage,
      title: successTitle
    });

    return res;
  } catch (err) {
    showNotificationWithIcon({
      icon: 'error',
      content:
        isApolloError(err) && err.graphQLErrors.length > 0
          ? `${failedMessage} ${err.graphQLErrors[0].message}`
          : failedMessage,
      title: failedTitle
    });
    return null;
  }
};
