import React from "react";
import { Input, DatePicker } from "antd";
import moment from "moment";
import PropTypes from "prop-types";

const UseExportForm = ({ formData, setFormData, openWarehouseKeeperModal }) => {
  UseExportForm.propTypes = {
    formData: PropTypes.shape({
      exportReason: PropTypes.string,
      receiverName: PropTypes.string,
      receiverPhone: PropTypes.string,
      receiverAddress: PropTypes.string,
      exportDate: PropTypes.string,
      exportTime: PropTypes.string,
      assignedWareHouseKeeper: PropTypes.shape({
        id: PropTypes.number,
        fullName: PropTypes.string,
        email: PropTypes.string,
      }),
      note: PropTypes.string,
      type: PropTypes.string, // Luôn là "USE"
    }).isRequired,
    setFormData: PropTypes.func.isRequired,
    openWarehouseKeeperModal: PropTypes.func.isRequired,
  };

  return (
    <>
      {/* Ngày nhận và Thời gian nhận trên cùng một hàng */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block mb-1">
            Ngày nhận <span className="text-red-500">*</span>
          </label>
          <DatePicker
            value={formData.exportDate ? moment(formData.exportDate) : null}
            onChange={(date, dateString) =>
              setFormData({ ...formData, exportDate: dateString })
            }
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block mb-1">
            Thời gian nhận <span className="text-red-500">*</span>
          </label>
          <DatePicker
            picker="time"
            format="HH:mm:ss"
            value={
              formData.exportTime
                ? moment(formData.exportTime, "HH:mm:ss")
                : null
            }
            onChange={(time, timeString) =>
              setFormData({ ...formData, exportTime: timeString })
            }
            className="w-full"
          />
        </div>
      </div>

      {/* Lý do xuất */}
      <div className="mb-4">
        <label className="block mb-1">
          Lý do xuất <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.exportReason || ""}
          placeholder="Nhập lý do xuất"
          onChange={(e) =>
            setFormData({ ...formData, exportReason: e.target.value })
          }
          className="w-full"
        />
      </div>

      {/* Tên người nhận */}
      <div className="mb-4">
        <label className="block mb-1">
          Tên người nhận <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.receiverName || ""}
          placeholder="Nhập tên người nhận"
          onChange={(e) =>
            setFormData({ ...formData, receiverName: e.target.value })
          }
          className="w-full"
        />
      </div>

      {/* Số điện thoại người nhận */}
      <div className="mb-4">
        <label className="block mb-1">
          Số điện thoại người nhận <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.receiverPhone || ""}
          placeholder="Nhập số điện thoại người nhận"
          onChange={(e) =>
            setFormData({ ...formData, receiverPhone: e.target.value })
          }
          className="w-full"
        />
      </div>

      {/* Địa chỉ người nhận */}
      <div className="mb-4">
        <label className="block mb-1">
          Địa chỉ người nhận <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.receiverAddress || ""}
          placeholder="Nhập địa chỉ người nhận"
          onChange={(e) =>
            setFormData({ ...formData, receiverAddress: e.target.value })
          }
          className="w-full"
        />
      </div>

      {/* Warehouse Keeper: hiện fullName - email nếu đã chọn, click để mở modal */}
      <div className="mb-4">
        <label className="block mb-1">Mã quản lý kho (nếu có)</label>
        <Input
          readOnly
          value={
            formData.assignedWareHouseKeeper
              ? `${formData.assignedWareHouseKeeper.fullName} - ${formData.assignedWareHouseKeeper.email}`
              : ""
          }
          placeholder="Chọn Warehouse Keeper"
          onClick={openWarehouseKeeperModal}
          className="w-full cursor-pointer"
        />
      </div>

      {/* Field type ẩn */}
      <div className="mb-4" style={{ display: "none" }}>
        <Input value={formData.type || "USE"} readOnly />
      </div>

      {/* Ghi chú */}
      <div className="mb-4">
        <label className="block mb-1">Ghi chú</label>
        <Input.TextArea
          rows={3}
          value={formData.note || ""}
          placeholder="Nhập ghi chú (nếu có)"
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          className="w-full"
        />
      </div>
    </>
  );
};

export default UseExportForm;
