import { Button, Col, Input, Row, Spin } from 'antd';
import * as React from 'react';
import { LoadingCard, LoadingIcon } from './CustomCards';

export interface EditableTextProps {
  text: string;
  onChange: (newValue: string) => Promise<any>;
}

interface EditableTextState {
  isOpen: boolean;
  isSaving: boolean;
  currentValue: string;
}

export class EditableText extends React.Component<
  EditableTextProps,
  EditableTextState
> {
  public state: EditableTextState = {
    isOpen: false,
    isSaving: false,
    currentValue: this.props.text
  };

  private handleOnChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ currentValue: ev.target.value });

  private handleToggleEditing = () =>
    this.setState({ isOpen: !this.state.isOpen });

  private handleSaveEdit = async () => {
    await this.setState({ isSaving: true, isOpen: false });
    await this.props.onChange(this.state.currentValue);
    await this.setState({ isSaving: false });
  };

  private handleKeyUp = (a: React.KeyboardEvent<HTMLInputElement>) => {
    if (a.key === 'Enter') {
      this.handleSaveEdit();
    } else if (a.key === 'Escape') {
      this.setState({ isOpen: false, currentValue: this.props.text });
    }
  };

  public render() {
    const { text } = this.props;
    const { isOpen, isSaving, currentValue } = this.state;

    if (isSaving) {
      return <Spin indicator={LoadingIcon} />;
    }

    return (
      <>
        {isOpen ? (
          <Input.Group>
            <Row type="flex">
              <Col>
                <Input
                  defaultValue={text}
                  onChange={this.handleOnChange}
                  onKeyUp={this.handleKeyUp}
                  style={{
                    borderRight: 0,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0
                  }}
                />
              </Col>
              <Col>
                <Button.Group>
                  <Button
                    icon="close"
                    onClick={this.handleToggleEditing}
                    style={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0
                    }}
                  />
                  <Button
                    disabled={currentValue.length === 0}
                    icon="save"
                    type="primary"
                    onClick={this.handleSaveEdit}
                  />
                </Button.Group>
              </Col>
            </Row>
          </Input.Group>
        ) : (
          <>
            {text}
            <Button
              style={{ border: 0 }}
              size="large"
              icon="edit"
              onClick={this.handleToggleEditing}
            />
          </>
        )}
      </>
    );
  }
}
