import * as React from 'react';
import { Component } from 'react';
import { Button, Popconfirm } from 'antd';
import { ButtonProps } from 'antd/lib/button';

interface AsyncButtonState {
  isLoading: boolean;
}

export class AsyncButton extends Component<
  ButtonProps & { onClick: () => Promise<any> } & { confirmClick?: boolean },
  AsyncButtonState
> {
  public componentWillMount() {
    this.setState({ isLoading: false });
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

    await this.setState({ isLoading: false });
  };

  public render() {
    const { isLoading } = this.state;
    const { children, disabled, type, icon, confirmClick } = this.props;

    if (confirmClick) {
      return (
        <Popconfirm
          title="Delete node?"
          onConfirm={this.handleClick}
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
        onClick={this.handleClick}
      >
        {children}
      </Button>
    );
  }
}
