export const sectionData = {
  title: "Bảo Hành (Warranty Claims)",
  description:
    "Trình theo dõi và xử lý các xe hư hỏng trong diện bảo hành, bao gồm quy trình tiếp nhận, thẩm định lỗi, thay thế miễn phí cho khách và lập hồ sơ claim gửi lên Hãng để lấy lại tiền.",
  pages: [
    {
      id: "warranty-claims",
      title: "Hồ sơ Bảo hành (Claims)",
      description:
        "Quy trình lập hồ sơ khiếu nại (Claim) hoàn hảo để đảm bảo Hãng chấp thuận 100%, tránh thất thoát tài chính cho đại lý.",
      route: "/factory/warranty/claims",
      steps: [
        "1. Tiếp nhận xe: Cố vấn dịch vụ tra cứu Sổ bảo hành điện tử để xác nhận xe còn hạn và không vi phạm quy định bảo hành (như độ chế, ngập nước).",
        "2. Tạo Lệnh sửa chữa (RO) với loại hình là 'Bảo hành' (Giá bán cho khách = 0 đồng).",
        "3. Chụp hình: Đây là bước quan trọng nhất. Cần chụp hình Số khung, Số máy, Góc rộng toàn xe, Cận cảnh phụ tùng hỏng, và Đồng hồ ODO.",
        "4. Vào menu [Bảo Hành] -> [Hồ sơ bảo hành], chọn RO vừa làm để tạo Claim mới.",
        "5. Tải ảnh lên và điền Mã lỗi (Symptom Code) theo đúng sách cẩm nang bảo hành của Hãng.",
        "6. Gửi Claim lên hệ thống của Hãng (Honda/Yamaha/Piaggio...) thông qua cổng tích hợp API (nếu có) hoặc xuất file.",
        "7. Theo dõi trạng thái: Chờ duyệt, Hãng đồng ý (Approve), Hãng từ chối (Reject), Hãng yêu cầu gửi trả phụ tùng hỏng về nhà máy.",
      ],
      tips: [
        "Nếu Hãng từ chối do hình ảnh mờ, có thể bổ sung hình ảnh và nhấn [Gửi lại].",
        "Tuyệt đối không vứt phụ tùng hỏng đi cho đến khi Hãng duyệt xong và thanh toán tiền. Một số phụ tùng lớn (như lốc máy, ECU) hãng sẽ yêu cầu gửi bưu điện về để giám định.",
        "Doanh thu từ bảo hành (Hãng trả) sẽ được Kế toán hạch toán thành một khoản thu nhập riêng biệt của xưởng.",
      ],
    },
  ],
};
