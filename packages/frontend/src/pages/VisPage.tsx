import * as React from 'react';
import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import { Col, Row, Card, Select, Form, Button } from 'antd';
import { Chart, Coord, Axis, Geom, Label } from 'bizcharts';
import { DataView } from '@antv/data-set';

const { Option, OptGroup } = Select;
const FormItem = Form.Item;

class VisPage extends React.Component<{}, {}> {
  public render() {
    const data = [
      { item: 'Wood', count: 40 },
      { item: 'Copper', count: 21 },
      { item: 'Wine', count: 17 }
    ];

    const dv = new DataView();
    dv.source(data).transform({
      type: 'percent',
      field: 'count',
      dimension: 'item',
      as: 'percent'
    });
    return (
      <>
        <Row style={{ marginBottom: 12, marginTop: 12 }}>
          <Col>
            <Card bordered={false}>
              <Form layout="inline">
                <FormItem label="Visualization source">
                  <Select style={{ width: 300 }}>
                    <OptGroup label="Outputs">
                      <Option value="a">
                        Wine export from London since 1900
                      </Option>
                      <Option value="b">
                        Trading between Leipzig and Berlin
                      </Option>
                    </OptGroup>
                    <OptGroup label="Datasets">
                      <Option value="d">Cities</Option>
                      <Option value="d">Passages</Option>
                      <Option value="e">Commodities</Option>
                    </OptGroup>
                  </Select>
                </FormItem>
              </Form>
            </Card>
          </Col>
        </Row>
        <Row gutter={12} style={{ marginBottom: 12 }}>
          <Col xs={{ span: 24 }} md={{ span: 12 }} style={{ marginBottom: 12 }}>
            <Card bordered={false}>
              <h3>Commodities Distribution 1800</h3>
              <p>
                Distribution of commodities between New York and London from
                1800-1810
              </p>

              <Chart height={400} data={dv}>
                <Coord type="theta" radius={0.75} />
                <Axis name="percent" />

                <Geom
                  type="intervalStack"
                  position="percent"
                  color="item"
                  tooltip={[
                    'item*percent',
                    (item, percent) => {
                      percent = percent * 100 + '%';
                      return {
                        name: item,
                        value: percent
                      };
                    }
                  ]}
                  style={{ lineWidth: 1, stroke: '#fff' }}
                >
                  <Label
                    content="percent"
                    formatter={(val, item) => {
                      return item.point.item;
                    }}
                  />
                </Geom>
              </Chart>
            </Card>
          </Col>
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
  includeInCard: false
})(VisPage);
