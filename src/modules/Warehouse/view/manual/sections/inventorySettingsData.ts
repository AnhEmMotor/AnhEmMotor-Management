export const sectionData = {
  title: "Cài đặt tồn kho",
  description: "Thiết lập cấu hình chung, định mức tồn và các quy tắc kho.",
  pages: [
    {
      id: "inventory-settings",
      title: "Cài đặt tồn kho",
      description: "Cấu hình số lượng cảnh báo tồn kho tối thiểu, tối đa.",
      route: "/Warehouse/inventory-settings",
      steps: [
        "Thiết lập định mức tồn kho an toàn cho từng nhóm hàng.",
        "Cấu hình các quy tắc đánh mã vạch tự động.",
        "Xác định phương pháp tính giá vốn (FIFO, LIFO...)."
      ],
      tips: ["Nên thiết lập cảnh báo tồn kho để hệ thống tự động nhắc nhở đặt hàng."]
    }
  ]
}
