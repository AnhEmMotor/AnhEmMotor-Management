export type TokenGroupKey = "customer" | "vehicle" | "finance" | "supplier";
export type TokenTone = "amber" | "emerald" | "violet" | "orange";

export interface ContractTemplateToken {
  key: string;
  label: string;
  group: TokenGroupKey;
}

export interface ContractTemplateTokenGroupMeta {
  key: TokenGroupKey;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  tone: TokenTone;
}

export interface ContractTemplateTokenGroup extends ContractTemplateTokenGroupMeta {
  tokens: ContractTemplateToken[];
}

export type TokenGroupMap = Record<TokenGroupKey, ContractTemplateToken[]>;

const tokenGroupKeys: TokenGroupKey[] = [
  "customer",
  "vehicle",
  "finance",
  "supplier",
];

export const contractTemplateTokenGroupMeta: ContractTemplateTokenGroupMeta[] =
  [
    {
      key: "customer",
      title: "Khách hàng",
      shortTitle: "Khách hàng",
      description: "Thông tin showroom, khách hàng và người đại diện",
      icon: "ri:user-line",
      tone: "amber",
    },
    {
      key: "vehicle",
      title: "Xe máy",
      shortTitle: "Xe máy",
      description: "Thông tin xe, giao nhận, bảo hành và điều khoản mua bán",
      icon: "ri:motorbike-line",
      tone: "emerald",
    },
    {
      key: "finance",
      title: "Tài chính / Trả góp",
      shortTitle: "Tài chính",
      description: "Thanh toán, khoản vay, giải ngân và hồ sơ tài chính",
      icon: "ri:money-dollar-circle-line",
      tone: "violet",
    },
    {
      key: "supplier",
      title: "Nhà cung cấp / Đối tác",
      shortTitle: "Nhà cung cấp",
      description: "Nhà cung cấp, hạn mức, phụ lục và hiệu lực hợp đồng",
      icon: "ri:building-4-line",
      tone: "orange",
    },
  ];

export const contractTemplateTokens: TokenGroupMap = {
  customer: [
    { key: "{{ContractNumber}}", label: "Số hợp đồng", group: "customer" },
    { key: "{{ContractDateText}}", label: "Ngày lập HĐ", group: "customer" },
    { key: "{{ContractLocation}}", label: "Địa điểm lập", group: "customer" },
    { key: "{{ShowroomName}}", label: "Tên showroom", group: "customer" },
    { key: "{{ShowroomTaxCode}}", label: "MST showroom", group: "customer" },
    {
      key: "{{ShowroomAddress}}",
      label: "Địa chỉ showroom",
      group: "customer",
    },
    { key: "{{ShowroomPhone}}", label: "SĐT showroom", group: "customer" },
    {
      key: "{{ShowroomRepresentative}}",
      label: "Đại diện showroom",
      group: "customer",
    },
    {
      key: "{{ShowroomRepresentativeTitle}}",
      label: "Chức danh đại diện",
      group: "customer",
    },
    {
      key: "{{ShowroomRepresentativeIdCard}}",
      label: "CCCD đại diện",
      group: "customer",
    },
    {
      key: "{{ShowroomRepresentativeIdIssuedDate}}",
      label: "Ngày cấp CCCD đại diện",
      group: "customer",
    },
    {
      key: "{{ShowroomRepresentativeIdIssuedPlace}}",
      label: "Nơi cấp CCCD đại diện",
      group: "customer",
    },
    { key: "{{ShowroomFax}}", label: "Fax showroom", group: "customer" },
    {
      key: "{{ShowroomBankAccount}}",
      label: "Tài khoản showroom",
      group: "customer",
    },
    {
      key: "{{ShowroomBankName}}",
      label: "Ngân hàng showroom",
      group: "customer",
    },
    { key: "{{CustomerName}}", label: "Tên khách hàng", group: "customer" },
    { key: "{{CustomerIdCard}}", label: "Số CCCD", group: "customer" },
    { key: "{{CustomerAddress}}", label: "Địa chỉ", group: "customer" },
    { key: "{{CustomerPhone}}", label: "Số điện thoại", group: "customer" },
    { key: "{{CustomerEmail}}", label: "Email", group: "customer" },
    {
      key: "{{CustomerRepresentativeTitle}}",
      label: "Chức danh bên mua",
      group: "customer",
    },
    {
      key: "{{CustomerIdIssuedDate}}",
      label: "Ngày cấp CCCD bên mua",
      group: "customer",
    },
    {
      key: "{{CustomerIdIssuedPlace}}",
      label: "Nơi cấp CCCD bên mua",
      group: "customer",
    },
    { key: "{{CustomerFax}}", label: "Fax bên mua", group: "customer" },
    {
      key: "{{CustomerBankAccount}}",
      label: "Tài khoản bên mua",
      group: "customer",
    },
    {
      key: "{{CustomerBankName}}",
      label: "Ngân hàng bên mua",
      group: "customer",
    },
  ],
  vehicle: [
    { key: "{{VehicleName}}", label: "Tên xe", group: "vehicle" },
    { key: "{{ChassisNumber}}", label: "Số khung", group: "vehicle" },
    { key: "{{EngineNumber}}", label: "Số máy", group: "vehicle" },
    { key: "{{VehiclePrice}}", label: "Đơn giá", group: "vehicle" },
    { key: "{{VehiclePriceInWords}}", label: "Giá bằng chữ", group: "vehicle" },
    { key: "{{VehicleColor}}", label: "Màu xe", group: "vehicle" },
    { key: "{{LicensePlate}}", label: "Biển số", group: "vehicle" },
    { key: "{{PaymentDueDate}}", label: "Ngày thanh toán", group: "vehicle" },
    {
      key: "{{PaymentMethod}}",
      label: "Hình thức thanh toán",
      group: "vehicle",
    },
    { key: "{{DeliveryDate}}", label: "Thời gian giao hàng", group: "vehicle" },
    {
      key: "{{DeliveryLocation}}",
      label: "Địa điểm giao hàng",
      group: "vehicle",
    },
    {
      key: "{{TransportationResponsibleParty}}",
      label: "Bên chịu vận chuyển",
      group: "vehicle",
    },
    {
      key: "{{StorageFeePerDay}}",
      label: "Phí lưu kho/ngày",
      group: "vehicle",
    },
    { key: "{{InspectionAgency}}", label: "Đơn vị kiểm tra", group: "vehicle" },
    {
      key: "{{ComplaintDeadlineDays}}",
      label: "Hạn khiếu nại",
      group: "vehicle",
    },
    {
      key: "{{SellerResponseDays}}",
      label: "Hạn phản hồi bên bán",
      group: "vehicle",
    },
    {
      key: "{{WarrantyProductName}}",
      label: "Hàng hóa bảo hành",
      group: "vehicle",
    },
    { key: "{{WarrantyMonths}}", label: "Tháng bảo hành", group: "vehicle" },
    { key: "{{PenaltyPercent}}", label: "Tỷ lệ phạt", group: "vehicle" },
    { key: "{{ContractCopies}}", label: "Số bản hợp đồng", group: "vehicle" },
    {
      key: "{{EachPartyCopies}}",
      label: "Số bản mỗi bên giữ",
      group: "vehicle",
    },
  ],
  finance: [
    { key: "{{DepositAmount}}", label: "Tiền cọc", group: "finance" },
    { key: "{{RemainingAmount}}", label: "Tiền còn lại", group: "finance" },
    {
      key: "{{FinancialPartner}}",
      label: "Đối tác tài chính",
      group: "finance",
    },
    {
      key: "{{FinancialPartnerContact}}",
      label: "Liên hệ tài chính",
      group: "finance",
    },
    {
      key: "{{FinanceContractNumber}}",
      label: "Số HĐ tài chính",
      group: "finance",
    },
    { key: "{{LoanAmount}}", label: "Số tiền vay", group: "finance" },
    { key: "{{TermMonths}}", label: "Kỳ hạn", group: "finance" },
    { key: "{{InterestRate}}", label: "Lãi suất", group: "finance" },
    { key: "{{MonthlyPayment}}", label: "Trả góp/tháng", group: "finance" },
    {
      key: "{{ExpectedDisbursementDate}}",
      label: "Ngày GN dự kiến",
      group: "finance",
    },
    {
      key: "{{ActualDisbursementDate}}",
      label: "Ngày GN thực tế",
      group: "finance",
    },
    {
      key: "{{ExpectedDisbursementAmount}}",
      label: "Tiền GN dự kiến",
      group: "finance",
    },
    {
      key: "{{ActualDisbursementAmount}}",
      label: "Tiền GN thực tế",
      group: "finance",
    },
    { key: "{{CavetStatus}}", label: "Trạng thái cavet", group: "finance" },
    { key: "{{ContractDate}}", label: "Ngày ký", group: "finance" },
  ],
  supplier: [
    { key: "{{SupplierName}}", label: "Tên NCC", group: "supplier" },
    { key: "{{SupplierContact}}", label: "Đầu mối liên hệ", group: "supplier" },
    { key: "{{CreditLimit}}", label: "Hạn mức tín dụng", group: "supplier" },
    {
      key: "{{DiscountPolicy}}",
      label: "Chính sách chiết khấu",
      group: "supplier",
    },
    { key: "{{TargetVolume}}", label: "Sản lượng cam kết", group: "supplier" },
    { key: "{{EffectiveDate}}", label: "Ngày hiệu lực", group: "supplier" },
    { key: "{{ExpiryDate}}", label: "Ngày hết hạn", group: "supplier" },
    { key: "{{ParentContractNumber}}", label: "Số HĐ gốc", group: "supplier" },
    {
      key: "{{AppendixChangeContent}}",
      label: "Nội dung phụ lục",
      group: "supplier",
    },
  ],
};

export const allContractTemplateTokens = tokenGroupKeys.flatMap(
  (key) => contractTemplateTokens[key],
);

const tokenByKey = new Map(
  allContractTemplateTokens.map((token) => [token.key, token]),
);

const tokenPattern = /\{\{[A-Za-z0-9_]+\}\}/g;

const isTokenGroupKey = (value: unknown): value is TokenGroupKey =>
  typeof value === "string" && tokenGroupKeys.includes(value as TokenGroupKey);

const emptyTokenGroups = (): TokenGroupMap => ({
  customer: [],
  vehicle: [],
  finance: [],
  supplier: [],
});

export const getFullTokenGroups = (): TokenGroupMap => ({
  customer: [...contractTemplateTokens.customer],
  vehicle: [...contractTemplateTokens.vehicle],
  finance: [...contractTemplateTokens.finance],
  supplier: [...contractTemplateTokens.supplier],
});

export const getTokenGroupByKey = (key: TokenGroupKey) =>
  contractTemplateTokenGroupMeta.find((group) => group.key === key);

export const getTokenGroupsForDisplay = (
  groups: TokenGroupMap = getFullTokenGroups(),
) =>
  contractTemplateTokenGroupMeta.map((group) => ({
    ...group,
    tokens: groups[group.key] || [],
  }));

export const filterTokenGroups = (
  groups: TokenGroupMap,
  searchValue: string,
) => {
  const search = searchValue.trim().toLowerCase();
  if (!search) return groups;

  const filtered = emptyTokenGroups();
  tokenGroupKeys.forEach((key) => {
    filtered[key] = groups[key].filter(
      (token) =>
        token.key.toLowerCase().includes(search) ||
        token.label.toLowerCase().includes(search),
    );
  });

  return filtered;
};

export const parseDynamicFields = (dynamicFields?: unknown): TokenGroupMap => {
  if (!dynamicFields) return getFullTokenGroups();

  let parsed: unknown = dynamicFields;
  if (typeof dynamicFields === "string") {
    try {
      parsed = JSON.parse(dynamicFields);
    } catch {
      return getFullTokenGroups();
    }
  }

  const groups = emptyTokenGroups();

  const pushToken = (rawToken: unknown, fallbackGroup?: TokenGroupKey) => {
    if (!rawToken || typeof rawToken !== "object") return;
    const token = rawToken as Partial<ContractTemplateToken>;
    if (typeof token.key !== "string") return;

    const knownToken = tokenByKey.get(token.key);
    const group = isTokenGroupKey(token.group)
      ? token.group
      : fallbackGroup || knownToken?.group;
    if (!group) return;

    groups[group].push({
      key: token.key,
      label:
        typeof token.label === "string"
          ? token.label
          : knownToken?.label || token.key,
      group,
    });
  };

  if (Array.isArray(parsed)) {
    parsed.forEach((token) => pushToken(token));
  } else if (parsed && typeof parsed === "object") {
    const record = parsed as Partial<Record<TokenGroupKey, unknown>>;
    tokenGroupKeys.forEach((key) => {
      const groupTokens = record[key];
      if (Array.isArray(groupTokens)) {
        groupTokens.forEach((token) => pushToken(token, key));
      }
    });
  }

  return tokenGroupKeys.some((key) => groups[key].length > 0)
    ? groups
    : getFullTokenGroups();
};

export const extractTemplateTokenKeys = (content = "") =>
  Array.from(new Set(content.match(tokenPattern) || []));

export const extractUsedTokenGroups = (
  content = "",
  groups: TokenGroupMap = getFullTokenGroups(),
) => {
  const usedTokenKeys = extractTemplateTokenKeys(content);
  const knownKeysInDisplayGroups = new Set(
    tokenGroupKeys.flatMap((group) => groups[group].map((token) => token.key)),
  );
  const usedGroups = emptyTokenGroups();
  const unknownTokens: string[] = [];

  usedTokenKeys.forEach((key) => {
    const token = tokenByKey.get(key);
    if (token && knownKeysInDisplayGroups.has(key)) {
      usedGroups[token.group].push(token);
      return;
    }

    unknownTokens.push(key);
  });

  return { groups: usedGroups, unknownTokens };
};

export const getUnresolvedPreviewTokens = (content = "") => {
  return extractTemplateTokenKeys(content);
};

export const buildPreviewHtml = (content = "") => {
  const source = content.trim() || "<p>Chưa có nội dung mẫu hợp đồng.</p>";
  let html = source;

  html = html.replace(
    tokenPattern,
    (token) => `<span class="contract-unresolved-token">${token}</span>`,
  );

  return `
    <div class="contract-preview-shell">
      <div class="contract-preview-badge">Bản xem thử - Cần nhập dữ liệu</div>
      ${html}
    </div>
  `;
};
