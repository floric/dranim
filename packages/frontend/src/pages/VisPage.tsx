import * as React from 'react';
import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import { Col, Row, Card, Select, Form, Button } from 'antd';

const { OptGroup } = Select;
const FormItem = Form.Item;

class VisPage extends React.Component<{}, {}> {
  public render() {
    return (
      <>
        <Row style={{ marginBottom: 12, marginTop: 12 }}>
          <Col>
            <Card bordered={false}>
              <Form layout="inline">
                <FormItem label="Source">
                  <Select style={{ width: 300 }}>
                    <OptGroup label="Outputs" />
                    <OptGroup label="Datasets" />
                  </Select>
                </FormItem>
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

export default withPageHeaderHoC({
  title: 'Visualizations',
  size: 'small',
  includeInCard: false
})(VisPage);
