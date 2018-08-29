import { Button, Col, Input, Row } from 'antd';
import * as React from 'react';

export interface EditableTextProps {
  text: string;
  onChange: (newValue: string) => any;
}

interface EditableTextState {
  isOpen: boolean;
  currentValue: string;
}

export class EditableText extends React.Component<
  EditableTextProps,
  EditableTextState
> {
  public state: EditableTextState = {
    isOpen: false,
    currentValue: this.props.text
  };

  private handleOnChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ currentValue: ev.target.value });

  private handleToggleEditing = () =>
    this.setState({ isOpen: !this.state.isOpen });

  private handleSaveEdit = () => {
    this.props.onChange(this.state.currentValue);
    this.setState({ isOpen: false });
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
    const { isOpen, currentValue } = this.state;

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
