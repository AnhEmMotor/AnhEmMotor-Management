// Dữ liệu mẫu Nhà cung cấp (Sample Data)
export const initialSuppliers = [
    {
        id: 'NCC000001',
        name: 'NCC ĐỒNG NAI',
        phone: '0898456123',
        email: 'Chưa có',
        totalPurchase: 3500000000,
        status: 'active',
        creator: 'Kim Ngân',
        creationDate: new Date('2025-10-10').getTime(),
        group: 'Vật liệu',
        notes: 'Nhà cung cấp chính về vật liệu xây dựng.',
        address: 'Đường X, Khu Y',
        cityDistrict: 'Biên Hòa, Đồng Nai',
        ward: 'Phường Z',
        transactions: [
            { code: 'PN000001', type: 'import', time: new Date('2025-10-10 10:20').getTime(), creator: 'Kim Ngân', total: 3500000000, status: 'Đã nhập hàng' },
            { code: 'PN000002', type: 'import', time: new Date('2025-09-05 15:45').getTime(), creator: 'Nguyễn B', total: 500000000, status: 'Đã nhập hàng' },
            { code: 'PN000003', type: 'return', time: new Date('2025-09-01 09:00').getTime(), creator: 'Kim Ngân', total: 10000000, status: 'Đã nhập hàng' },
        ]
    },
    {
        id: 'NCC000002',
        name: 'CÔNG TY ABC',
        phone: '0901234567',
        email: 'abc@email.com',
        totalPurchase: 50000000,
        status: 'active',
        creator: 'Nguyễn Văn A',
        creationDate: new Date('2025-05-01').getTime(),
        group: 'Điện tử',
        notes: 'Chuyên cung cấp thiết bị điện tử.',
        address: '123 Nguyễn Huệ',
        cityDistrict: 'Quận 1, TP.HCM',
        ward: 'Bến Nghé',
        transactions: [
            { code: 'PN000105', type: 'import', time: new Date('2025-08-10 12:00').getTime(), creator: 'Trần C', total: 50000000, status: 'Đã nhập hàng' },
        ]
    },
    {
        id: 'NCC000003',
        name: 'CỬA HÀNG MINH',
        phone: '0339876543',
        email: 'Chưa có',
        totalPurchase: 12500000,
        status: 'inactive',
        creator: 'Trần Thị B',
        creationDate: new Date('2024-09-20').getTime(),
        group: 'Khác',
        notes: 'Đã ngừng hợp tác từ tháng trước.',
        address: 'Chưa có',
        cityDistrict: 'Chưa có',
        ward: 'Chưa có',
        transactions: []
    },
    {
        id: 'NCC000004',
        name: 'SUPPLIER XYZ',
        phone: '0777111222',
        email: 'info@xyz.com',
        totalPurchase: 150000000,
        status: 'active',
        creator: 'Lê Văn C',
        creationDate: new Date('2025-01-05').getTime(),
        group: 'Điện tử',
        notes: 'Nhà cung cấp phụ tùng.',
        address: '456 Lê Lợi',
        cityDistrict: 'Hà Nội',
        ward: 'Hoàn Kiếm',
        transactions: [
            { code: 'PN000300', type: 'import', time: new Date('2025-07-20 17:30').getTime(), creator: 'Phạm D', total: 100000000, status: 'Đã nhập hàng' },
            { code: 'PN000301', type: 'import', time: new Date('2025-07-21 08:00').getTime(), creator: 'Lê Văn C', total: 50000000, status: 'Đã nhập hàng' },
        ]
    },
    {
        id: 'NCC000005',
        name: 'VẬT TƯ MIỀN NAM',
        phone: '0912345678',
        email: 'vtm@mail.vn',
        totalPurchase: 200000000,
        status: 'active',
        creator: 'Phạm Thị D',
        creationDate: new Date('2025-08-15').getTime(),
        group: 'Vật liệu',
        notes: '',
        address: '999 Hậu Giang',
        cityDistrict: 'Cần Thơ',
        ward: 'Ninh Kiều',
        transactions: [
            { code: 'PN000550', type: 'import', time: new Date('2025-09-01 10:30').getTime(), creator: 'Phạm D', total: 200000000, status: 'Đã nhập hàng' },
            { code: 'PN000551', type: 'return', time: new Date('2025-09-05 14:00').getTime(), creator: 'Phạm D', total: 5000000, status: 'Đã nhập hàng' },
        ]
    },
];

// Dữ liệu mẫu Nhóm Nhà Cung Cấp
export const initialSupplierGroups = [
    { name: 'Vật liệu', notes: 'Các nhà cung cấp nguyên vật liệu chính.' },
    { name: 'Điện tử', notes: 'Các nhà cung cấp thiết bị điện và điện tử.' },
    { name: 'Khác', notes: 'Nhóm chung.' },
];
