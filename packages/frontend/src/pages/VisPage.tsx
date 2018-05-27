import * as React from 'react';

import { Button, Card, Col, Form, Row, Select } from 'antd';

import { PageHeaderCard } from '../components/PageHeaderCard';

export default class VisPage extends React.Component<{}, {}> {
  public render() {
    return (
      <>
        <PageHeaderCard title="Visualizations" />
        <Row style={{ marginBottom: 12, marginTop: 12 }}>
          <Col>
            <Card bordered={false}>
              <Form layout="inline">
                <Form.Item label="Source">
                  <Select style={{ width: 300 }}>
                    <Select.OptGroup label="Outputs" />
                    <Select.OptGroup label="Datasets" />
                  </Select>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
        <Row gutter={12} style={{ marginBottom: 12 }}>
          <Col xs={{ span: 24 }} md={{ span: 12 }} style={{ marginBottom: 12 }}>
            <Card bordered={false}>
              <Button icon="plus" type="primary">
                Add another Visualization
              </Button>
            </Card>
          </Col>
        </Row>
      </>
    );
  }
}
