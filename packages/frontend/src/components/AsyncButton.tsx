import * as React from 'react';

import { Button, Popconfirm, Tooltip } from 'antd';
import { ButtonProps } from 'antd/lib/button';

interface AsyncButtonState {
  isLoading: boolean;
}

export type AsyncButtonProps = {
  onClick?: () => Promise<any>;
  confirmClick?: boolean;
  confirmMessage?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  tooltip?: string;
} & ButtonProps;

type FullWidthButtonProps = {
  handleClick?: () => any;
  disabled: boolean;
  tooltip?: string;
} & AsyncButtonProps;

const FullWidthButton: React.SFC<FullWidthButtonProps> = ({
  children,
  style,
  handleClick,
  fullWidth,
  tooltip,
  ...props
}) => (
  <Tooltip title={tooltip} mouseEnterDelay={1} defaultVisible={false}>
    <Button
      style={{
        ...style,
        ...{
          width: fullWidth ? '100%' : style ? style.width : undefined
        }
      }}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  </Tooltip>
);

export class AsyncButton extends React.Component<
  AsyncButtonProps,
  AsyncButtonState
> {
  private mounted = false;

  public state: AsyncButtonState = { isLoading: false };

  public componentDidMount() {
    this.mounted = true;
  }

  public componentWillUnmount() {
    this.mounted = false;
  }

  private handleClick = async () => {
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
      disabled = false,
      fullWidth = false,
      confirmClick,
      confirmMessage = 'Really do this action?',
      onClick,
      loading,
      ...otherProps
    } = this.props;

    if (confirmClick) {
      return (
        <Popconfirm
          title={confirmMessage}
          onConfirm={this.handleClick}
          okText="Confirm"
          cancelText="Cancel"
        >
          <FullWidthButton
            loading={isLoading}
            fullWidth={fullWidth}
            disabled={disabled}
            {...otherProps}
          />
        </Popconfirm>
      );
    }

    return (
      <FullWidthButton
        handleClick={this.handleClick}
        loading={isLoading}
        fullWidth={fullWidth}
        disabled={disabled}
        {...otherProps}
      />
    );
  }
}
