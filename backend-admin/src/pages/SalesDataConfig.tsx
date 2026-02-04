import React, { useEffect, useState } from 'react';
import { Card, Table, Typography, Space, Button, Tabs, App } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { adminApiGet, adminApiPost } from '../config/api';

const { Title } = Typography;

interface HourlyPoint {
  hour: number;
  units: number;
  sales: number;
}

interface HourlySeries {
  date: string;
  hours: HourlyPoint[];
}

interface DailyPoint {
  date: string;
  units: number;
  sales: number;
  lastYearUnits?: number;
  lastYearSales?: number;
}

interface SalesTimeSeries {
  store_id: string;
  updated_at?: string;
  day?: {
    today?: HourlySeries;
    yesterday?: HourlySeries;
    sameDayLastWeek?: HourlySeries;
    sameDayLastYear?: HourlySeries;
  };
  week?: {
    current: DailyPoint[];
    lastWeek: DailyPoint[];
    lastYear: DailyPoint[];
  };
  month?: {
    current: DailyPoint[];
    lastMonth: DailyPoint[];
    lastYear: DailyPoint[];
  };
  year?: {
    days: DailyPoint[];
  };
}

interface SalesDataConfigProps {
  selectedStoreId: string;
  selectedStore: any;
  onStoreChange: (storeId: string, store: any) => void;
}

const formatHourLabel = (hour: number) => {
  const normalized = hour % 24;
  const suffix = normalized < 12 ? 'AM' : 'PM';
  const display = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${display}${suffix}`;
};

const formatCurrency = (value: number) => `$${Number(value || 0).toLocaleString()}`;

const SalesDataConfig: React.FC<SalesDataConfigProps> = ({
  selectedStoreId,
  selectedStore
}) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [timeSeries, setTimeSeries] = useState<SalesTimeSeries | null>(null);

  const loadTimeSeries = async () => {
    if (!selectedStoreId) return;
    setLoading(true);
    try {
      const result = await adminApiGet(`/api/sales/admin/time-series/${selectedStoreId}`);
      if (result) {
        setTimeSeries(result || null);
      } else {
        message.error('加载销售数据失败');
      }
    } catch (error) {
      message.error('加载销售数据失败');
      console.error('Load sales time series error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStoreId) {
      loadTimeSeries();
    } else {
      setTimeSeries(null);
    }
  }, [selectedStoreId]);

  const regenerateTimeSeries = async () => {
    if (!selectedStoreId) {
      message.error('请先选择店铺');
      return;
    }
    setLoading(true);
    try {
      const result = await adminApiPost(`/api/sales/admin/time-series/generate/${selectedStoreId}`);
      if (result?.success) {
        message.success('样本数据生成成功！');
        await loadTimeSeries();
      } else {
        message.error(result?.message || '生成失败');
      }
    } catch (error) {
      message.error('生成失败，请重试');
      console.error('Generate time series error:', error);
    } finally {
      setLoading(false);
    }
  };

  const hourlyColumns = [
    {
      title: '小时',
      dataIndex: 'hour',
      key: 'hour',
      render: (value: number) => formatHourLabel(value),
      width: 120,
    },
    {
      title: '销量 (Units)',
      dataIndex: 'units',
      key: 'units',
      render: (value: number) => Number(value || 0).toLocaleString(),
    },
    {
      title: '销售额 ($)',
      dataIndex: 'sales',
      key: 'sales',
      render: (value: number) => formatCurrency(value),
    },
  ];

  const dailyColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (value: string) => new Date(value).toLocaleDateString(),
      width: 140,
    },
    {
      title: '销量 (Units)',
      dataIndex: 'units',
      key: 'units',
      render: (value: number) => Number(value || 0).toLocaleString(),
    },
    {
      title: '销售额 ($)',
      dataIndex: 'sales',
      key: 'sales',
      render: (value: number) => formatCurrency(value),
    },
  ];

  const yearColumns = [
    ...dailyColumns,
    {
      title: '去年销量',
      dataIndex: 'lastYearUnits',
      key: 'lastYearUnits',
      render: (value: number) => Number(value || 0).toLocaleString(),
    },
    {
      title: '去年销售额',
      dataIndex: 'lastYearSales',
      key: 'lastYearSales',
      render: (value: number) => formatCurrency(value),
    },
  ];

  const renderHourlyCard = (title: string, series?: HourlySeries) => (
    <Card size="small" title={title} style={{ marginBottom: 16 }}>
      <Table
        columns={hourlyColumns}
        dataSource={(series?.hours || []).map(point => ({ ...point, key: point.hour }))}
        pagination={false}
        loading={loading}
        size="small"
        scroll={{ y: 240 }}
      />
    </Card>
  );

  const renderDailyCard = (title: string, data?: DailyPoint[], useYearColumns = false) => (
    <Card size="small" title={title} style={{ marginBottom: 16 }}>
      <Table
        columns={useYearColumns ? yearColumns : dailyColumns}
        dataSource={(data || []).map((item, index) => ({ ...item, key: `${item.date}-${index}` }))}
        pagination={false}
        loading={loading}
        size="small"
        scroll={{ y: 260 }}
      />
    </Card>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>销售数据配置</Title>
        <p style={{ color: '#666' }}>
          管理前端 Sales Snapshot 与 Business Reports 图表使用的数据。Today 小时数据来自 Global Snapshot，其余维度来自 Business Reports 配置。
        </p>
        {selectedStore && (
          <div style={{ fontSize: '14px', color: '#666', marginTop: 8 }}>
            当前店铺: <strong>{selectedStore.name}</strong> ({selectedStore.marketplace})
          </div>
        )}
      </div>

      {!selectedStoreId ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 0',
          color: '#999',
          fontSize: '16px'
        }}>
          请先在页面顶部选择一个店铺
        </div>
      ) : (
        <Card
          title="销售数据配置"
          extra={
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={regenerateTimeSeries}
                loading={loading}
              >
                生成样本数据
              </Button>
            </Space>
          }
        >
          <Tabs
            defaultActiveKey="day"
            items={[
              {
                key: 'day',
                label: '日维度（小时）',
                children: (
                  <>
                    {renderHourlyCard('Today (24小时)', timeSeries?.day?.today)}
                    {renderHourlyCard('Yesterday (24小时)', timeSeries?.day?.yesterday)}
                    {renderHourlyCard('Same day last week', timeSeries?.day?.sameDayLastWeek)}
                    {renderHourlyCard('Same day last year', timeSeries?.day?.sameDayLastYear)}
                  </>
                )
              },
              {
                key: 'week',
                label: '周维度（7天）',
                children: (
                  <>
                    {renderDailyCard('This week to date', timeSeries?.week?.current)}
                    {renderDailyCard('Last week', timeSeries?.week?.lastWeek)}
                    {renderDailyCard('Same week last year', timeSeries?.week?.lastYear)}
                  </>
                )
              },
              {
                key: 'month',
                label: '月维度（1-31天）',
                children: (
                  <>
                    {renderDailyCard('This month to date', timeSeries?.month?.current)}
                    {renderDailyCard('Last month', timeSeries?.month?.lastMonth)}
                    {renderDailyCard('Same month last year', timeSeries?.month?.lastYear)}
                  </>
                )
              },
              {
                key: 'year',
                label: '年维度（按天）',
                children: (
                  <Card size="small" title="Year to date (按天)">
                    <Table
                      columns={yearColumns}
                      dataSource={(timeSeries?.year?.days || []).map((item, index) => ({
                        ...item,
                        key: `${item.date}-${index}`
                      }))}
                      pagination={{
                        pageSize: 20,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: total => `共 ${total} 条记录`,
                      }}
                      loading={loading}
                      size="small"
                      scroll={{ y: 400 }}
                    />
                  </Card>
                )
              }
            ]}
          />
        </Card>
      )}
    </div>
  );
};

export default SalesDataConfig;
