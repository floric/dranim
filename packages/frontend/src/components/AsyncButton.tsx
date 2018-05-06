import * as React from 'react';
import { Component } from 'react';
import { Button } from 'antd';
import { ButtonProps } from 'antd/lib/button';

interface AsyncButtonState {
  isLoading: boolean;
}

export class AsyncButton extends Component<
  ButtonProps & { onClick: () => Promise<any> },
  AsyncButtonState
> {
  public componentWillMount() {
    this.setState({ isLoading: false });
  }

  private handleClick = async (ev: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ isLoading: true });

    try {
      if (this.props.onClick) {
        await this.props.onClick();
      }
    } catch (e) {
      console.log(e);
    }

    this.setState({ isLoading: false });
  };

  public render() {
    const { children, disabled, type, icon } = this.props;
    return (
      <Button
        type={type}
        icon={icon}
        disabled={disabled}
        loading={this.state.isLoading}
        onClick={this.handleClick}
      >
        {children}
      </Button>
    );
  }
}
