import * as React from 'react';

import { Button, Popconfirm } from 'antd';
import { ButtonProps } from 'antd/lib/button';

interface AsyncButtonState {
  isLoading: boolean;
}

export interface AsyncButtonProps {
  onClick: () => Promise<any>;
  confirmClick?: boolean;
  confirmMessage?: string;
  fullWidth?: boolean;
}

export class AsyncButton extends React.Component<
  AsyncButtonProps & ButtonProps,
  AsyncButtonState
> {
  private mounted = false;

  public componentWillMount() {
    this.setState({ isLoading: false });
  }

  public componentDidMount() {
    this.mounted = true;
  }

  public componentWillUnmount() {
    this.mounted = false;
  }

  private handleClick = async (ev: React.MouseEvent<HTMLButtonElement>) => {
    await this.setState({ isLoading: true });

    try {
      if (this.props.onClick) {
        await this.props.onClick();
      }
    } catch (err) {
      console.log(err);
    }
    if (this.mounted) {
      await this.setState({ isLoading: false });
    }
  };

  public render() {
    const { isLoading } = this.state;
    const {
      children,
      disabled,
      type,
      icon,
      fullWidth = true,
      confirmClick,
      confirmMessage = 'Really do this action?'
    } = this.props;

    if (confirmClick) {
      return (
        <Popconfirm
          title={confirmMessage}
          onConfirm={ev => this.handleClick(ev)}
          okText="Confirm"
          cancelText="Cancel"
        >
          <Button
            style={fullWidth ? { width: '100%' } : undefined}
            type={type}
            icon={icon}
            disabled={disabled}
            loading={isLoading}
          >
            {children}
          </Button>
        </Popconfirm>
      );
    }

    return (
      <Button
        style={fullWidth ? { width: '100%' } : undefined}
        type={type}
        icon={icon}
        disabled={disabled}
        loading={isLoading}
        onClick={ev => this.handleClick(ev)}
      >
        {children}
      </Button>
    );
  }
}
