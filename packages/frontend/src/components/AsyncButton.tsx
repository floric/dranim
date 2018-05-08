import * as React from 'react';
import { Component } from 'react';
import { Button, Popconfirm } from 'antd';
import { ButtonProps } from 'antd/lib/button';

interface AsyncButtonState {
  isLoading: boolean;
}

export class AsyncButton extends Component<
  ButtonProps & { onClick: () => Promise<any> } & {
    confirmClick?: boolean;
    confirmMessage?: string;
  },
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
    } catch (e) {
      console.log(e);
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
      confirmClick,
      confirmMessage
    } = this.props;

    if (confirmClick) {
      return (
        <Popconfirm
          title={confirmMessage ? confirmMessage : 'Really do this action?'}
          onConfirm={ev => this.handleClick(ev)}
          okText="Confirm"
          cancelText="Cancel"
        >
          <Button
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
