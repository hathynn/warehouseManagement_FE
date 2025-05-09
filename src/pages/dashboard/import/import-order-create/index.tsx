import { useState, useEffect, useCallback, useRef } from "react";
import { Button, Input, Typography, Space, Card, DatePicker, TimePicker, message, Alert } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import useImportOrderService, { ImportOrderCreateRequest, ImportStatus } from "@/hooks/useImportOrderService";
import useImportRequestService, { ImportRequestResponse } from "@/hooks/useImportRequestService";
import useImportOrderDetailService from "@/hooks/useImportOrderDetailService";
import useImportRequestDetailService, { ImportRequestDetailResponse } from "@/hooks/useImportRequestDetailService";
import useConfigurationService from "@/hooks/useConfigurationService";
import { toast } from "react-toastify";
import dayjs, { Dayjs } from "dayjs";
import { useSelector } from "react-redux";
import { InfoCircleOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { ROUTES } from "@/constants/routes";
import { RootState } from "@/redux/store";
import ExcelUploadSection from "@/components/commons/ExcelUploadSection";
import TableSection from "@/components/commons/TableSection";

const { Title } = Typography;
const { TextArea } = Input;

interface FormData extends Omit<ImportOrderCreateRequest, 'dateReceived' | 'timeReceived'> {
  dateReceived: string;
  timeReceived: string;
  status: ImportStatus;
}

interface ExcelItemContent {
  itemId: number;
  plannedQuantity: number;
}

interface TablePagination {
  current: number;
  pageSize: number;
  total: number;
}

// Convert Excel serial number to YYYY-MM-DD if needed
function excelDateToYMD(serial: number): string {
  // Excel epoch is 1899-12-30 (UTC)
  const excelEpoch = Date.UTC(1899, 11, 30);
  const ms = serial * 24 * 60 * 60 * 1000;
  const date = new Date(excelEpoch + ms);
  return date.toISOString().split('T')[0];
}

// Convert Excel serial number to HH:mm if needed
function excelTimeToHM(serial: number): string {
  const totalMinutes = Math.round(serial * 24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

const ImportOrderCreate = () => {
  const { importRequestId: paramImportRequestId } = useParams<{ importRequestId: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const { getConfiguration } = useConfigurationService();
  const [configuration, setConfiguration] = useState<{ createRequestTimeAtLeast: string } | null>(null);
  const [defaultDateTime, setDefaultDateTime] = useState<{ date: string; time: string }>({
    date: "",
    time: ""
  });

  const getDefaultDateTime = useCallback(() => {
    const now = dayjs();
    const hours = configuration ? parseInt(configuration.createRequestTimeAtLeast.split(':')[0]) : 12;
    const defaultTime = now.add(hours, 'hour').add(30, 'minute');
    return {
      date: defaultTime.format("YYYY-MM-DD"),
      time: defaultTime.format("HH:mm")
    };
  }, [configuration]);

  useEffect(() => {
    const fetchConfiguration = async () => {
      try {
        const config = await getConfiguration();
        if (config) {
          setConfiguration(config);
        }
      } catch (error) {
        console.error("Error fetching configuration:", error);
      }
    };
    fetchConfiguration();
  }, []);

  useEffect(() => {
    if (configuration) {
      setDefaultDateTime(getDefaultDateTime());
    }
  }, [configuration, getDefaultDateTime]);

  useEffect(() => {
    if (defaultDateTime.date && defaultDateTime.time) {
      setFormData(prev => ({
        ...prev,
        dateReceived: defaultDateTime.date,
        timeReceived: defaultDateTime.time
      }));
    }
  }, [defaultDateTime]);

  const [importRequests, setImportRequests] = useState<ImportRequestResponse[]>([]);
  const [selectedImportRequest, setSelectedImportRequest] = useState<number | null>(null);
  const [importRequestDetails, setImportRequestDetails] = useState<ImportRequestDetailResponse[]>([]);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [uploadedExcelItems, setUploadedExcelItems] = useState<ExcelItemContent[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pagination, setPagination] = useState<TablePagination>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [formData, setFormData] = useState<FormData>({
    importRequestId: null,
    accountId: null,
    dateReceived: defaultDateTime.date,
    timeReceived: defaultDateTime.time,
    note: "",
    status: ImportStatus.NOT_STARTED
  });

  const [showFormFields, setShowFormFields] = useState<boolean>(false);

  const {
    loading: importRequestLoading,
    getAllImportRequests,
  } = useImportRequestService();

  const {
    loading: importRequestDetailLoading,
    getImportRequestDetails,
  } = useImportRequestDetailService();

  const {
    loading: importOrderLoading,
    createImportOrder,
  } = useImportOrderService();

  const {
    loading: importOrderDetailLoading,
    createImportOrderDetails: uploadImportOrderDetail
  } = useImportOrderDetailService();

  useEffect(() => {
    const fetchImportRequests = async () => {
      try {
        const response = await getAllImportRequests();
        if (response?.content) {
          setImportRequests(response.content);

          if (paramImportRequestId) {
            const importRequestIdNum = Number(paramImportRequestId);
            setSelectedImportRequest(importRequestIdNum);
            setFormData(prev => ({
              ...prev,
              importRequestId: importRequestIdNum
            }))
          }
        }
      } catch (error) {
        console.error("Error fetching import requests:", error);
      }
    };

    fetchImportRequests();
  }, [paramImportRequestId]);

  useEffect(() => {
    if (selectedImportRequest) {
      fetchImportRequestDetails();
    }
  }, [selectedImportRequest, pagination.current, pagination.pageSize]);

  const fetchImportRequestDetails = useCallback(async () => {
    if (!selectedImportRequest) return;

    try {
      setDetailsLoading(true);
      const { current, pageSize } = pagination;
      const response = await getImportRequestDetails(
        selectedImportRequest,
        current,
        pageSize
      );

      if (response?.content) {
        const detailsWithPlannedQuantity = response.content.map(detail => ({
          ...detail,
          plannedQuantity: detail.expectQuantity
        }));

        setImportRequestDetails(detailsWithPlannedQuantity);

        if (response.metaDataDTO) {
          setPagination(prev => ({
            ...prev,
            current: response.metaDataDTO.page,
            pageSize: response.metaDataDTO.limit,
            total: response.metaDataDTO.total,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch import request details:", error);
      message.error("Không thể tải danh sách chi tiết phiếu nhập");
    } finally {
      setDetailsLoading(false);
    }
  }, [selectedImportRequest, pagination.current, pagination.pageSize, getImportRequestDetails]);

  const validateDateTime = (date: string, time: string) => {
    const selectedDateTime = dayjs(`${date} ${time}`);
    const now = dayjs();
    const hours = configuration ? parseInt(configuration.createRequestTimeAtLeast.split(':')[0]) : 12;
    const minDateTime = now.add(hours, 'hour');
    return selectedDateTime.isAfter(minDateTime);
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (!date) return;
    const newDate = date.format("YYYY-MM-DD");
    setFormData(prev => ({
      ...prev,
      dateReceived: newDate
    }));
  };

  const handleTimeChange = (time: Dayjs | null) => {
    if (!time) return;
    const newTime = time.format("HH:mm");
    setFormData(prev => ({
      ...prev,
      timeReceived: newTime
    }));
  };

  const handleSubmit = async () => {
    if (!formData.importRequestId) {
      toast.error("Vui lòng chọn phiếu nhập");
      return;
    }
    const hours = configuration ? parseInt(configuration.createRequestTimeAtLeast.split(':')[0]) : 12;
    if (!validateDateTime(formData.dateReceived, formData.timeReceived)) {
      toast.error(`Thời gian nhập hàng phải cách thời điểm hiện tại ít nhất ${hours} giờ`);
      return;
    }
    try {
      const createOrderRequest: ImportOrderCreateRequest = {
        importRequestId: formData.importRequestId,
        accountId: formData.accountId,
        dateReceived: formData.dateReceived,
        timeReceived: formData.timeReceived,
        note: formData.note
      };
      const response = await createImportOrder(createOrderRequest);
      if (response?.content) {
        if (excelFile) {
          // Use the original Excel file instead of creating a new one
          await uploadImportOrderDetail(excelFile, response.content.importOrderId);
        }
        navigate(ROUTES.PROTECTED.IMPORT.ORDER.LIST_FROM_REQUEST(selectedImportRequest.toString()));
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        "itemId": "Mã hàng (số)",
        "quantity": "Số lượng (số)",
        "dateReceived": "Ngày nhận (DD/MM/YY)",
        "timeReceived": "Giờ nhận (HH:MM)",
        "note": "Ghi chú"
      }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "import_order_template.xlsx");
  };

  const getExcelFieldValue = (row: Record<string, any>, possibleNames: string[]): any => {
    for (const name of possibleNames) {
      if (name in row) return row[name];
    }
    return null;
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;
    setExcelFile(uploadedFile);
    setFileName(uploadedFile.name);
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const ab = event.target?.result;
        if (ab instanceof ArrayBuffer) {
          const wb = XLSX.read(ab, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(ws);
          if (jsonData.length === 0) {
            toast.error("File Excel không có dữ liệu");
            return;
          }

          // Get the first row of the Excel file
          const firstRow = jsonData[0] as Record<string, any>;

          // Check for item and quantity fields
          const hasItemId = 'itemId' in firstRow || 'Mã hàng' in firstRow;
          const hasQuantity = 'quantity' in firstRow || 'Số lượng' in firstRow;
          if (!hasItemId || !hasQuantity) {
            toast.error("File Excel phải có cột 'itemId'/'Mã hàng' và 'quantity'/'Số lượng'");
            return;
          }

          // Extract date, time, and note from the first row (handle Excel serial numbers)
          const dateFieldRaw = getExcelFieldValue(firstRow, ['dateReceived', 'Ngày nhận', 'ngày nhận', 'Ngay nhan']);
          const timeFieldRaw = getExcelFieldValue(firstRow, ['timeReceived', 'Giờ nhận', 'giờ nhận', 'Gio nhan']);
          const noteField = getExcelFieldValue(firstRow, ['note', 'Ghi chú', 'ghi chú', 'Ghi chu']);

          let dateField = dateFieldRaw;
          if (typeof dateFieldRaw === 'number') {
            dateField = excelDateToYMD(dateFieldRaw);
          }

          let timeField = timeFieldRaw;
          if (typeof timeFieldRaw === 'number') {
            timeField = excelTimeToHM(timeFieldRaw);
          }

          setFormData(prev => ({
            ...prev,
            dateReceived: dateField || prev.dateReceived,
            timeReceived: timeField || prev.timeReceived,
            note: noteField ? noteField.toString() : prev.note
          }));

          // Show form fields after Excel upload
          setShowFormFields(true);

          // Process item details from Excel
          const excelDetails = jsonData.map((row: Record<string, any>) => ({
            itemId: Number(row.itemId || row['Mã hàng']),
            plannedQuantity: Number(row.quantity || row['Số lượng'])
          }));
          const validExcelDetails = excelDetails.filter(ed =>
            importRequestDetails.some(ird => ird.itemId === ed.itemId)
          );
          if (validExcelDetails.length === 0) {
            toast.warning("Không có mã hàng nào trong file Excel khớp với phiếu nhập");
            setExcelFile(null);
            setFileName("");
            return;
          }
          setUploadedExcelItems(validExcelDetails);
          toast.success(`Đã cập nhật số lượng dự tính cho ${validExcelDetails.length} mã hàng từ file Excel`);
        }
      } catch (error) {
        toast.error("Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.");
        setExcelFile(null);
        setFileName("");
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const columns = [
    {
      title: "Mã hàng",
      dataIndex: "itemId",
      key: "itemId",
      render: (id: number) => `#${id}`,
      align: "right" as const
    },
    {
      title: "Tên hàng",
      dataIndex: "itemName",
      key: "itemName",
      width: "30%",
    },
    {
      title: "Tổng dự nhập",
      dataIndex: "expectQuantity",
      key: "expectQuantity",
      align: "right" as const,
    },
    {
      title: "Tổng đã lên đơn",
      dataIndex: "orderedQuantity",
      key: "orderedQuantity",
      align: "right" as const,
    },
    {
      title: "Dự nhập của đơn này",
      dataIndex: "plannedQuantity",
      key: "plannedQuantity",
      align: "right" as const,
      render: (_: any, record: ImportRequestDetailResponse) => {
        const uploadedDetail = uploadedExcelItems.find(d => d.itemId === record.itemId);
        const plannedQuantity = uploadedDetail
          ? uploadedDetail.plannedQuantity
          : "Chưa có";
        return (
          <span
            className="font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-md inline-block"
          >
            {plannedQuantity}
          </span>
        );
      },
    },
  ];

  const loading = importOrderLoading || importRequestLoading || importOrderDetailLoading || importRequestDetailLoading;

  return (
    <div className="container mx-auto p-5">
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>Tạo đơn nhập kho - {importRequests.find(request => request.importRequestId === selectedImportRequest)
          ? `Phiếu nhập #${selectedImportRequest}`
          : 'Chưa chọn phiếu nhập'}
        </Title>
      </div>
      <div className="flex gap-6">
        <Card title="Thông tin đơn nhập" className="w-3/10">
          <Space direction="vertical" className="w-full">
            {selectedImportRequest && (
              <>
                <ExcelUploadSection
                  fileName={fileName}
                  onFileChange={handleExcelUpload}
                  onDownloadTemplate={downloadTemplate}
                  fileInputRef={fileInputRef}
                  buttonLabel="Tải lên file Excel"
                />
                <Alert
                  description="Hệ thống sẽ bỏ qua các itemId (Mã hàng) không tồn tại trong phiếu nhập"
                  type="info"
                  showIcon
                  className="!p-4"
                />
              </>
            )}

            {/* Show form fields only after Excel upload or when showFormFields is true */}
            {showFormFields && (
              <>
                <div>
                  <label className="block mb-1">Ngày nhận <span className="text-red-500">*</span></label>
                  <DatePicker
                    className="w-full"
                    value={formData.dateReceived ? dayjs(formData.dateReceived) : null}
                    onChange={handleDateChange}
                    disabledDate={(current) => {
                      const hours = configuration ? parseInt(configuration.createRequestTimeAtLeast.split(':')[0]) : 12;
                      return current && current.isBefore(dayjs().add(hours, 'hour').startOf('day'));
                    }}
                    showNow={false}
                  />
                </div>
                <div>
                  <label className="block mb-1">Giờ nhận <span className="text-red-500">*</span></label>
                  <TimePicker
                    className="w-full"
                    value={formData.timeReceived ? dayjs(`1970-01-01 ${formData.timeReceived}`) : null}
                    onChange={handleTimeChange}
                    format="HH:mm"
                    showNow={false}
                    needConfirm={false}
                    disabledTime={() => {
                      const now = dayjs();
                      const selectedDate = dayjs(formData.dateReceived);
                      const hours = configuration ? parseInt(configuration.createRequestTimeAtLeast.split(':')[0]) : 12;
                      const minDateTime = now.add(hours, 'hour');
                      if (selectedDate.isSame(minDateTime, 'day')) {
                        return {
                          disabledHours: () => Array.from({ length: minDateTime.hour() }, (_, i) => i),
                          disabledMinutes: () => {
                            if (minDateTime.hour() === now.hour()) {
                              return Array.from({ length: minDateTime.minute() }, (_, i) => i);
                            }
                            return [];
                          }
                        };
                      }
                      return {};
                    }}
                  />
                  <div className="text-sm text-red-500 mt-1">
                    <InfoCircleOutlined className="mr-1" />
                    Giờ nhận phải cách thời điểm hiện tại ít nhất {configuration ? parseInt(configuration.createRequestTimeAtLeast.split(':')[0]) : 12} giờ
                  </div>
                </div>
                <div>
                  <label className="block mb-1">Ghi chú</label>
                  <TextArea
                    placeholder="Nhập ghi chú"
                    rows={4}
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full"
                  />
                </div>
              </>
            )}

            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              className="w-full mt-4"
              id="btn-detail"
              disabled={!selectedImportRequest || !excelFile}
            >
              Xác nhận tạo đơn nhập
            </Button>
          </Space>
        </Card>
        <div className="w-7/10">
          <TableSection
            title={`Danh sách hàng hóa cần nhập - Phiếu nhập #${selectedImportRequest}`}
            columns={columns}
            data={importRequestDetails}
            rowKey="importRequestDetailId"
            loading={detailsLoading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total: number) => `Tổng cộng ${total} sản phẩm trong phiếu nhập`,
              onChange: (page: number, pageSize: number) => setPagination(prev => ({ ...prev, current: page, pageSize })),
            }}
            emptyText={selectedImportRequest
              ? "Không có dữ liệu chi tiết cho phiếu nhập này"
              : "Vui lòng chọn phiếu nhập để xem chi tiết"}
          />
        </div>
      </div>
    </div>
  );
};

export default ImportOrderCreate;
