import React, { useState, useEffect } from "react";
import { Table, Button, Input, Tag, Spin } from "antd";
import { Link } from "react-router-dom";
import useImportRequestService from "../../../../hooks/useImportRequestService";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { DEPARTMENT_ROUTER } from "@/constants/routes";

const ImportRequestList = () => {
  const [importRequests, setImportRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const {
    getImportRequestsByPage,
    loading
  } = useImportRequestService();

  useEffect(() => {
    fetchImportRequests();
  }, [pagination.current, pagination.pageSize]);

  const fetchImportRequests = async () => {
    try {
      const response = await getImportRequestsByPage(pagination.current, pagination.pageSize);
      
      // Update state with the content array from the response
      if (response && response.content) {
        setImportRequests(response.content);
      }
      
      // Update pagination with metadata
      if (response && response.metaDataDTO) {
        setPagination({
          current: response.metaDataDTO.page,
          pageSize: response.metaDataDTO.limit,
          total: response.metaDataDTO.total,
        });
      }
    } catch (error) {
      console.error("Failed to fetch import requests:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTableChange = (pagination) => {
    setPagination({
      ...pagination,
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "NOT_STARTED":
        return <Tag color="default">Chưa bắt đầu</Tag>;
      case "IN_PROGRESS":
        return <Tag color="processing">Đang xử lý</Tag>;
      case "COMPLETED":
        return <Tag color="success">Hoàn tất</Tag>;
      case "CANCELLED":
        return <Tag color="error">Đã hủy</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getImportTypeText = (type) => {
    switch (type) {
      case "ORDER":
        return "Đơn hàng";
      case "RETURN":
        return "Trả hàng";
      default:
        return type;
    }
  };

  const filteredItems = importRequests.filter((item) =>
    item.importRequestId.toString().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: "Mã phiếu nhập",
      dataIndex: "importRequestId",
      key: "importRequestId",
      render: (id) => `#${id}`,
      width: '10%',
    },
    {
      title: "Loại nhập",
      dataIndex: "importType",
      key: "importType",
      render: (type) => getImportTypeText(type),
    },
    {
      title: "Lý do nhập",
      dataIndex: "importReason",
      key: "importReason",
      ellipsis: true,
      width: '20%'
    },
    {
      title: "Mã nhà cung cấp",
      dataIndex: "providerId",
      key: "providerId",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedDate",
      key: "updatedDate",
      render: (date) => date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Chi tiết",
      key: "detail",
      render: (text, record) => (
        <Link to={DEPARTMENT_ROUTER.IMPORT.REQUEST.DETAIL(record.importRequestId)}>
          <Button id="btn-detail" className="!p-0" type="link">
            Chi tiết
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className={`mx-auto`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Danh sách phiếu nhập</h1>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Tìm kiếm theo mã phiếu nhập"
          value={searchTerm}
          onChange={handleSearchChange}
          prefix={<SearchOutlined />}
          className="max-w-md"
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredItems}
        rowKey="importRequestId"
        className="custom-table mb-4"
        loading={loading}
        onChange={handleTableChange}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['10', '50'],
          showTotal: (total) => `Tổng cộng có ${total} phiếu nhập`,
        }}
      />

      <div className="mt-4">
        <Link to={DEPARTMENT_ROUTER.IMPORT.REQUEST.CREATE}>
          <Button
            type="primary"
            id="btn-create"
            icon={<PlusOutlined />}
          >
            Tạo Phiếu Nhập
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ImportRequestList;
