import * as React from 'react';
import * as D3NE from 'd3-node-editor';

export class EditableComponent<
  EditableComponentProperties
> extends D3NE.Component {
  public compName = '';

  constructor(title: string, compName: string, props: D3NE.ComponentProps) {
    super(title, props);
    this.compName = compName;
  }

  public renderProperties = (properties: EditableComponentProperties) => {
    return <p>Props</p>;
  };
}
